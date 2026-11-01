package com.medipriority.service;

import com.medipriority.dsa.heap.PatientPriorityQueue;
import com.medipriority.dsa.heap.QueueEntry;
import com.medipriority.dto.request.TriageRequest;
import com.medipriority.dto.response.QueueEntryResponse;
import com.medipriority.dto.response.TriageResponse;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.TriageRecord;
import com.medipriority.model.User;
import com.medipriority.repository.EmergencyRequestRepository;
import com.medipriority.repository.TriageRecordRepository;
import com.medipriority.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Triage service — creates and manages clinical assessments.
 * Integrates with the custom priority queue.
 *
 * <p>Key rule: triage records are immutable.
 * Each reassessment creates a new row with incremented version.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TriageService {

    private final TriageRecordRepository triageRecordRepository;
    private final EmergencyRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final PriorityQueueService priorityQueueService;
    private final AuditService auditService;

    /**
     * Creates a new triage assessment for an emergency request.
     * Updates the priority queue with the new clinical priority.
     */
    @Transactional
    public TriageResponse assess(TriageRequest req, Long medicalOfficerId) {
        EmergencyRequest er = requestRepository.findById(req.requestId())
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyRequest", req.requestId()));
        User officer = userRepository.findById(medicalOfficerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", medicalOfficerId));

        // Determine next version number
        int nextVersion = triageRecordRepository
                .findMaxVersionByRequestId(req.requestId())
                .map(v -> v + 1)
                .orElse(1);

        TriageRecord record = TriageRecord.builder()
                .emergencyRequest(er)
                .medicalOfficer(officer)
                .triageCategory(req.triageCategory())
                .clinicalNotes(req.clinicalNotes())
                .vitalSignsJson(req.vitalSignsJson())
                .assessmentVersion(nextVersion)
                .build();

        TriageRecord saved = triageRecordRepository.save(record);

        // Update emergency request status to TRIAGED if first triage
        if (er.getRequestStatus() == EmergencyRequest.RequestStatus.PENDING_TRIAGE) {
            er.setRequestStatus(EmergencyRequest.RequestStatus.TRIAGED);
            requestRepository.save(er);
        }

        // Update in-memory priority queue
        priorityQueueService.insertOrUpdate(er.getRequestId(),
                req.triageCategory().getPriorityValue(),
                er.getCreatedAt(),
                nextVersion);

        auditService.log(medicalOfficerId, "TRIAGE_ASSESSED", "TriageRecord",
                saved.getTriageId(),
                "{\"category\":\"" + req.triageCategory() + "\",\"version\":" + nextVersion + "}");

        return toResponse(saved);
    }

    public List<TriageResponse> getHistory(Long requestId) {
        return triageRecordRepository
                .findByEmergencyRequest_RequestIdOrderByAssessmentVersionDesc(requestId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<QueueEntryResponse> getPriorityQueue() {
        return priorityQueueService.getOrderedQueue();
    }

    private TriageResponse toResponse(TriageRecord t) {
        return new TriageResponse(
                t.getTriageId(),
                t.getEmergencyRequest().getRequestId(),
                t.getEmergencyRequest().getRequestNumber(),
                t.getEmergencyRequest().getPatient().getFullName(),
                t.getTriageCategory(),
                t.getTriageCategory().getPriorityValue(),
                t.getClinicalNotes(),
                t.getVitalSignsJson(),
                t.getAssessmentVersion(),
                t.getMedicalOfficer().getFullName(),
                t.getAssessedAt()
        );
    }
}
