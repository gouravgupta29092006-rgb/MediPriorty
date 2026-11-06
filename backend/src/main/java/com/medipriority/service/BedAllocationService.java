package com.medipriority.service;

import com.medipriority.dto.response.BedAllocationResponse;
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
import java.util.List;

/**
 * Bed allocation service.
 *
 * <p>Allocation flow:
 * <ol>
 *   <li>Validate request exists and has arrived (or is in valid pre-admission state).</li>
 *   <li>Check for existing active bed allocation (409 if duplicate).</li>
 *   <li>Find available beds of required type.</li>
 *   <li>Pessimistic-lock the chosen bed row.</li>
 *   <li>Revalidate bed status inside transaction.</li>
 *   <li>Mark bed RESERVED, create allocation record, emit audit log.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BedAllocationService {

    private final BedAllocationRepository bedAllocationRepository;
    private final BedRepository bedRepository;
    private final EmergencyRequestRepository requestRepository;
    private final TriageRecordRepository triageRecordRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PriorityQueueService priorityQueueService;

    /**
     * Auto-assigns the first available bed of the required type.
     *
     * @param requestId  the emergency request
     * @param assignerId the user performing the assignment
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BedAllocationResponse autoAssign(Long requestId, Long assignerId) {
        EmergencyRequest er = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyRequest", requestId));

        if (bedAllocationRepository.existsByEmergencyRequest_RequestIdAndStatus(
                requestId, BedAllocation.AllocationStatus.ACTIVE)) {
            throw new ResourceConflictException(
                    "Request " + requestId + " already has an active bed allocation");
        }

        Bed.BedType requiredType = er.getRequiredBedType() != null
                ? Bed.BedType.valueOf(er.getRequiredBedType().name())
                : Bed.BedType.GENERAL;

        List<Bed> available = bedRepository.findAvailableByType(Bed.BedStatus.AVAILABLE, requiredType);
        if (available.isEmpty()) {
            throw new AllocationFailedException(
                    "No available " + requiredType + " beds at this time");
        }

        return doAllocate(requestId, available.get(0).getBedId(), assignerId);
    }

    /**
     * Manual bed assignment to a specific bed.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BedAllocationResponse manualAssign(Long requestId, Long bedId, Long assignerId) {
        if (bedAllocationRepository.existsByEmergencyRequest_RequestIdAndStatus(
                requestId, BedAllocation.AllocationStatus.ACTIVE)) {
            throw new ResourceConflictException(
                    "Request " + requestId + " already has an active bed allocation");
        }
        return doAllocate(requestId, bedId, assignerId);
    }

    /**
     * Core allocation with pessimistic lock and in-transaction revalidation.
     */
    private BedAllocationResponse doAllocate(Long requestId, Long bedId, Long assignerId) {
        // Pessimistic lock — prevents double-reservation under concurrency
        Bed bed = bedRepository.findByIdWithLock(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed", bedId));

        if (bed.getStatus() != Bed.BedStatus.AVAILABLE) {
            throw new ResourceConflictException(
                    "Bed " + bedId + " is no longer available (status: " + bed.getStatus() + ")");
        }

        EmergencyRequest er = requestRepository.findById(requestId).orElseThrow();
        User assigner = userRepository.findById(assignerId).orElseThrow();

        bed.setStatus(Bed.BedStatus.RESERVED);
        bedRepository.save(bed);

        er.setRequestStatus(EmergencyRequest.RequestStatus.BED_RESERVED);
        requestRepository.save(er);

        BedAllocation allocation = BedAllocation.builder()
                .emergencyRequest(er)
                .bed(bed)
                .allocatedBy(assigner)
                .reservedAt(LocalDateTime.now())
                .status(BedAllocation.AllocationStatus.ACTIVE)
                .build();
        BedAllocation saved = bedAllocationRepository.save(allocation);

        auditService.log(assignerId, "BED_RESERVED", "BedAllocation",
                saved.getAllocationId(),
                "{\"requestId\":" + requestId + ",\"bedId\":" + bedId + "}");

        priorityQueueService.rebuildFromDatabase();

        return toResponse(saved);
    }

    /**
     * Admit patient to bed — transitions from RESERVED to OCCUPIED.
     */
    @Transactional
    public BedAllocationResponse admit(Long allocationId, Long actingUserId) {
        BedAllocation allocation = getAllocationOrThrow(allocationId);
        allocation.setAdmittedAt(LocalDateTime.now());
        allocation.getBed().setStatus(Bed.BedStatus.OCCUPIED);
        allocation.getEmergencyRequest().setRequestStatus(EmergencyRequest.RequestStatus.ADMITTED);
        bedRepository.save(allocation.getBed());
        requestRepository.save(allocation.getEmergencyRequest());
        auditService.log(actingUserId, "PATIENT_ADMITTED", "BedAllocation", allocationId, null);

        priorityQueueService.handleRequestLifecycleChange(allocation.getEmergencyRequest().getRequestId());

        return toResponse(bedAllocationRepository.save(allocation));
    }

    /**
     * Release bed — patient discharged, bed marked CLEANING.
     */
    @Transactional
    public BedAllocationResponse release(Long allocationId, Long actingUserId) {
        BedAllocation allocation = getAllocationOrThrow(allocationId);
        allocation.setReleasedAt(LocalDateTime.now());
        allocation.setStatus(BedAllocation.AllocationStatus.COMPLETED);
        allocation.getBed().setStatus(Bed.BedStatus.CLEANING);
        allocation.getEmergencyRequest().setRequestStatus(EmergencyRequest.RequestStatus.CLOSED);
        allocation.getEmergencyRequest().setClosedAt(LocalDateTime.now());
        bedRepository.save(allocation.getBed());
        requestRepository.save(allocation.getEmergencyRequest());
        auditService.log(actingUserId, "BED_RELEASED", "BedAllocation", allocationId, null);

        priorityQueueService.handleRequestLifecycleChange(allocation.getEmergencyRequest().getRequestId());

        return toResponse(bedAllocationRepository.save(allocation));
    }

    public Page<BedAllocationResponse> findAll(Pageable pageable) {
        return bedAllocationRepository.findFiltered(null, pageable).map(this::toResponse);
    }

    private BedAllocation getAllocationOrThrow(Long id) {
        return bedAllocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BedAllocation", id));
    }

    private BedAllocationResponse toResponse(BedAllocation a) {
        return new BedAllocationResponse(
                a.getAllocationId(),
                a.getEmergencyRequest().getRequestId(),
                a.getEmergencyRequest().getRequestNumber(),
                a.getEmergencyRequest().getPatient().getFullName(),
                a.getBed().getBedId(),
                a.getBed().getBedNumber(),
                a.getBed().getBedType().name(),
                a.getBed().getDepartment().getDepartmentName(),
                a.getAllocatedBy().getFullName(),
                a.getStatus(),
                a.getReservedAt(),
                a.getAdmittedAt(),
                a.getReleasedAt(),
                a.getCreatedAt());
    }
}
