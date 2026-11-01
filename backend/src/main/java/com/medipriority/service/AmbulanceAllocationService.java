package com.medipriority.service;

import com.medipriority.allocation.AmbulanceCandidate;
import com.medipriority.dsa.sorting.MergeSort;
import com.medipriority.dto.response.AmbulanceAllocationResponse;
import com.medipriority.exception.AllocationFailedException;
import com.medipriority.exception.ResourceConflictException;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.*;
import com.medipriority.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Ambulance allocation service.
 *
 * <p>Allocation flow:
 * <ol>
 *   <li>Validate request exists and is triaged.</li>
 *   <li>Check for existing active allocation (409 if duplicate).</li>
 *   <li>Load all AVAILABLE ambulances.</li>
 *   <li>Estimate travel time for each using RoadNetworkService/Dijkstra.</li>
 *   <li>Compute capability score based on triage category vs equipment.</li>
 *   <li>Rank candidates using custom MergeSort.</li>
 *   <li>Select best candidate; pessimistic-lock the ambulance row in DB.</li>
 *   <li>Revalidate status inside transaction (prevent race condition).</li>
 *   <li>Set ambulance to DISPATCHED, create allocation record, emit audit log.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AmbulanceAllocationService {

    private final AmbulanceAllocationRepository allocationRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final EmergencyRequestRepository requestRepository;
    private final TriageRecordRepository triageRecordRepository;
    private final UserRepository userRepository;
    private final RoadNetworkService roadNetworkService;
    private final PriorityQueueService priorityQueueService;
    private final AuditService auditService;

    private final MergeSort<AmbulanceCandidate> sorter = new MergeSort<>();

    /**
     * Auto-selects and dispatches the best available ambulance to a request.
     *
     * @param requestId   the emergency request to serve
     * @param dispatcherId the user performing the dispatch
     * @return the allocation record
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public AmbulanceAllocationResponse autoDispatch(Long requestId, Long dispatcherId) {
        EmergencyRequest er = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyRequest", requestId));

        // Guard: must be triaged before dispatch
        if (er.getRequestStatus() == EmergencyRequest.RequestStatus.PENDING_TRIAGE) {
            throw new AllocationFailedException(
                    "Request " + requestId + " must be triaged before ambulance dispatch");
        }

        // Guard: no duplicate active allocation
        if (allocationRepository.existsByEmergencyRequest_RequestIdAndStatus(
                requestId, AmbulanceAllocation.AllocationStatus.ACTIVE)) {
            throw new ResourceConflictException(
                    "Request " + requestId + " already has an active ambulance allocation");
        }

        TriageRecord triage = triageRecordRepository.findLatestByRequestId(requestId)
                .orElseThrow(() -> new AllocationFailedException(
                        "No triage record found for request " + requestId));

        // Build candidates
        List<Ambulance> available = ambulanceRepository.findByCurrentStatus(
                Ambulance.AmbulanceStatus.AVAILABLE);

        if (available.isEmpty()) {
            throw new AllocationFailedException("No available ambulances at this time");
        }

        List<AmbulanceCandidate> candidates = new ArrayList<>();
        for (Ambulance amb : available) {
            double travel = (amb.getCurrentNode() != null)
                    ? roadNetworkService.estimateTravelTime(
                            amb.getCurrentNode().getNodeId(), null)
                    : 999.0; // no position data → treat as far
            int capability = computeCapabilityScore(triage.getTriageCategory(),
                    amb.getEquipmentLevel());
            candidates.add(new AmbulanceCandidate(amb, travel, capability));
        }

        // Sort: best capability first, then shortest travel time
        AmbulanceCandidate[] arr = candidates.toArray(new AmbulanceCandidate[0]);
        sorter.sort(arr, Comparator
                .comparingInt((AmbulanceCandidate c) -> -c.capabilityScore)   // desc
                .thenComparingDouble(c -> c.estimatedTravelMinutes));          // asc

        AmbulanceCandidate best = arr[0];
        return doAllocate(requestId, best.ambulance.getAmbulanceId(), dispatcherId);
    }

    /**
     * Manually dispatches a specific ambulance to a request.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public AmbulanceAllocationResponse manualDispatch(Long requestId, Long ambulanceId,
                                                       Long dispatcherId) {
        if (allocationRepository.existsByEmergencyRequest_RequestIdAndStatus(
                requestId, AmbulanceAllocation.AllocationStatus.ACTIVE)) {
            throw new ResourceConflictException(
                    "Request " + requestId + " already has an active ambulance allocation");
        }
        return doAllocate(requestId, ambulanceId, dispatcherId);
    }

    /**
     * Core allocation method. Pessimistic-locks the ambulance row, revalidates, and commits.
     */
    private AmbulanceAllocationResponse doAllocate(Long requestId, Long ambulanceId,
                                                    Long dispatcherId) {
        // Pessimistic lock — prevents double-allocation under concurrency
        Ambulance ambulance = ambulanceRepository.findByIdWithLock(ambulanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance", ambulanceId));

        // Revalidate inside transaction
        if (ambulance.getCurrentStatus() != Ambulance.AmbulanceStatus.AVAILABLE) {
            throw new ResourceConflictException(
                    "Ambulance " + ambulanceId + " is no longer available (status: "
                    + ambulance.getCurrentStatus() + ")");
        }

        EmergencyRequest er = requestRepository.findById(requestId).orElseThrow();
        User dispatcher = userRepository.findById(dispatcherId).orElseThrow();

        // Reserve ambulance
        ambulance.setCurrentStatus(Ambulance.AmbulanceStatus.DISPATCHED);
        ambulanceRepository.save(ambulance);

        // Update request status
        er.setRequestStatus(EmergencyRequest.RequestStatus.AMBULANCE_DISPATCHED);
        requestRepository.save(er);

        // Create allocation record
        AmbulanceAllocation allocation = AmbulanceAllocation.builder()
                .emergencyRequest(er)
                .ambulance(ambulance)
                .allocatedBy(dispatcher)
                .dispatchTime(LocalDateTime.now())
                .status(AmbulanceAllocation.AllocationStatus.ACTIVE)
                .build();
        AmbulanceAllocation saved = allocationRepository.save(allocation);

        auditService.log(dispatcherId, "AMBULANCE_DISPATCHED", "AmbulanceAllocation",
                saved.getAllocationId(),
                "{\"requestId\":" + requestId + ",\"ambulanceId\":" + ambulanceId + "}");

        return toResponse(saved);
    }

    /**
     * Mark arrival — ambulance reached the patient.
     */
    @Transactional
    public AmbulanceAllocationResponse markArrived(Long allocationId, Long actingUserId) {
        AmbulanceAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("AmbulanceAllocation", allocationId));
        allocation.setArrivalTime(LocalDateTime.now());
        allocation.getAmbulance().setCurrentStatus(Ambulance.AmbulanceStatus.ON_SCENE);
        allocation.getEmergencyRequest().setRequestStatus(EmergencyRequest.RequestStatus.ARRIVED);
        requestRepository.save(allocation.getEmergencyRequest());
        ambulanceRepository.save(allocation.getAmbulance());
        return toResponse(allocationRepository.save(allocation));
    }

    /**
     * Complete allocation — ambulance returning to station.
     */
    @Transactional
    public AmbulanceAllocationResponse complete(Long allocationId, Long actingUserId) {
        AmbulanceAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("AmbulanceAllocation", allocationId));
        allocation.setCompletionTime(LocalDateTime.now());
        allocation.setStatus(AmbulanceAllocation.AllocationStatus.COMPLETED);
        allocation.getAmbulance().setCurrentStatus(Ambulance.AmbulanceStatus.AVAILABLE);
        ambulanceRepository.save(allocation.getAmbulance());
        auditService.log(actingUserId, "AMBULANCE_ALLOCATION_COMPLETED",
                "AmbulanceAllocation", allocationId, null);
        return toResponse(allocationRepository.save(allocation));
    }

    public Page<AmbulanceAllocationResponse> findAll(Pageable pageable) {
        return allocationRepository.findAll(pageable).map(this::toResponse);
    }

    /**
     * Capability score: 3=perfect match, 2=acceptable, 1=minimal.
     */
    private int computeCapabilityScore(TriageRecord.TriageCategory category,
                                        Ambulance.EquipmentLevel level) {
        return switch (category) {
            case RED -> switch (level) {
                case CRITICAL -> 3;
                case ALS -> 2;
                case BLS -> 1;
            };
            case ORANGE -> switch (level) {
                case CRITICAL, ALS -> 3;
                case BLS -> 1;
            };
            case YELLOW, GREEN -> switch (level) {
                case CRITICAL, ALS, BLS -> 3;
            };
        };
    }

    private AmbulanceAllocationResponse toResponse(AmbulanceAllocation a) {
        return new AmbulanceAllocationResponse(
                a.getAllocationId(),
                a.getEmergencyRequest().getRequestId(),
                a.getEmergencyRequest().getRequestNumber(),
                a.getEmergencyRequest().getPatient().getFullName(),
                a.getAmbulance().getAmbulanceId(),
                a.getAmbulance().getRegistrationNumber(),
                a.getAmbulance().getAmbulanceType().name(),
                a.getAllocatedBy().getFullName(),
                a.getStatus(),
                a.getDispatchTime(),
                a.getArrivalTime(),
                a.getCompletionTime(),
                a.getCreatedAt());
    }
}
