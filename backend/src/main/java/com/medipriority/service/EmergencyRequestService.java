package com.medipriority.service;

import com.medipriority.dto.request.EmergencyRequestRequest;
import com.medipriority.dto.response.EmergencyRequestResponse;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.Patient;
import com.medipriority.repository.EmergencyRequestRepository;
import com.medipriority.repository.TriageRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class EmergencyRequestService {

    private final EmergencyRequestRepository requestRepository;
    private final TriageRecordRepository triageRecordRepository;
    private final PatientService patientService;
    private final AuditService auditService;

    private static final AtomicLong SEQUENCE = new AtomicLong(1);

    @Transactional
    public EmergencyRequestResponse create(EmergencyRequestRequest req, Long actingUserId) {
        Patient patient = patientService.getOrThrow(req.patientId());

        String requestNumber = generateRequestNumber();

        EmergencyRequest er = EmergencyRequest.builder()
                .patient(patient)
                .requestNumber(requestNumber)
                .requestStatus(EmergencyRequest.RequestStatus.PENDING_TRIAGE)
                .pickupLocation(req.pickupLocation())
                .pickupLatitude(req.pickupLatitude())
                .pickupLongitude(req.pickupLongitude())
                .requiredBedType(req.requiredBedType())
                .build();

        EmergencyRequest saved = requestRepository.save(er);
        auditService.log(actingUserId, "EMERGENCY_REQUEST_CREATED", "EmergencyRequest",
                saved.getRequestId(), null);
        return toResponse(saved);
    }

    public Page<EmergencyRequestResponse> findAll(EmergencyRequest.RequestStatus status, Pageable pageable) {
        return requestRepository.findAllFiltered(status, pageable).map(this::toResponse);
    }

    public EmergencyRequestResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public EmergencyRequestResponse updateStatus(Long id, EmergencyRequest.RequestStatus newStatus,
                                                  Long actingUserId) {
        EmergencyRequest er = getOrThrow(id);
        er.setRequestStatus(newStatus);
        if (newStatus == EmergencyRequest.RequestStatus.CLOSED
                || newStatus == EmergencyRequest.RequestStatus.CANCELLED) {
            er.setClosedAt(LocalDateTime.now());
        }
        auditService.log(actingUserId, "REQUEST_STATUS_UPDATED", "EmergencyRequest", id,
                "{\"status\":\"" + newStatus + "\"}");
        return toResponse(requestRepository.save(er));
    }

    public List<EmergencyRequest> getActiveTriagedRequests() {
        return requestRepository.findByRequestStatusIn(List.of(
                EmergencyRequest.RequestStatus.TRIAGED,
                EmergencyRequest.RequestStatus.AMBULANCE_DISPATCHED,
                EmergencyRequest.RequestStatus.BED_RESERVED));
    }

    public EmergencyRequest getOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyRequest", id));
    }

    private EmergencyRequestResponse toResponse(EmergencyRequest er) {
        String currentTriage = triageRecordRepository
                .findLatestByRequestId(er.getRequestId())
                .map(t -> t.getTriageCategory().name())
                .orElse(null);

        return new EmergencyRequestResponse(
                er.getRequestId(), er.getRequestNumber(), er.getRequestStatus(),
                er.getPatient().getPatientId(), er.getPatient().getFullName(),
                er.getPickupLocation(), er.getPickupLatitude(), er.getPickupLongitude(),
                er.getRequiredBedType(), currentTriage,
                er.getCreatedAt(), er.getUpdatedAt());
    }

    private String generateRequestNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        // Check DB for accurate sequence; AtomicLong is a fallback for concurrent safety
        long count = requestRepository.count() + 1;
        return String.format("REQ-%s-%04d", date, count);
    }
}
