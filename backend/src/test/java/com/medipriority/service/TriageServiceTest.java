package com.medipriority.service;

import com.medipriority.dto.request.TriageRequest;
import com.medipriority.dto.response.TriageResponse;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.Patient;
import com.medipriority.model.TriageRecord;
import com.medipriority.model.User;
import com.medipriority.repository.EmergencyRequestRepository;
import com.medipriority.repository.TriageRecordRepository;
import com.medipriority.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TriageService Unit Tests")
class TriageServiceTest {

    @Mock
    private TriageRecordRepository triageRecordRepository;
    @Mock
    private EmergencyRequestRepository requestRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PriorityQueueService priorityQueueService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private TriageService triageService;

    private EmergencyRequest emergencyRequest;
    private User doctor;
    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = Patient.builder()
                .patientId(1L)
                .fullName("John Doe")
                .build();

        emergencyRequest = EmergencyRequest.builder()
                .requestId(10L)
                .requestNumber("REQ-20261101-0001")
                .requestStatus(EmergencyRequest.RequestStatus.PENDING_TRIAGE)
                .patient(patient)
                .createdAt(LocalDateTime.now())
                .build();

        doctor = User.builder()
                .userId(3L)
                .fullName("Dr. Sarah Connor")
                .role(User.Role.MEDICAL_OFFICER)
                .build();
    }

    @Test
    @DisplayName("Should assign RED triage category, transition request status to TRIAGED and update priority queue")
    void testAssessTriage() {
        TriageRequest req = new TriageRequest(
                10L,
                TriageRecord.TriageCategory.RED,
                "Severe respiratory distress",
                "{\"bp\":\"80/50\",\"hr\":140,\"spo2\":82}"
        );

        when(requestRepository.findById(10L)).thenReturn(Optional.of(emergencyRequest));
        when(userRepository.findById(3L)).thenReturn(Optional.of(doctor));
        when(triageRecordRepository.findMaxVersionByRequestId(10L)).thenReturn(Optional.empty());

        TriageRecord savedRecord = TriageRecord.builder()
                .triageId(100L)
                .emergencyRequest(emergencyRequest)
                .medicalOfficer(doctor)
                .triageCategory(TriageRecord.TriageCategory.RED)
                .clinicalNotes(req.clinicalNotes())
                .vitalSignsJson(req.vitalSignsJson())
                .assessmentVersion(1)
                .assessedAt(LocalDateTime.now())
                .build();

        when(triageRecordRepository.save(any(TriageRecord.class))).thenReturn(savedRecord);

        TriageResponse res = triageService.assess(req, 3L);

        assertNotNull(res);
        assertEquals(TriageRecord.TriageCategory.RED, res.triageCategory());
        assertEquals(1, res.priorityValue());
        assertEquals(1, res.assessmentVersion());

        // Verify emergency request status was updated to TRIAGED
        assertEquals(EmergencyRequest.RequestStatus.TRIAGED, emergencyRequest.getRequestStatus());
        verify(requestRepository).save(emergencyRequest);

        // Verify in-memory priority queue was updated
        verify(priorityQueueService).insertOrUpdate(eq(10L), eq(1), any(), eq(1));

        // Verify audit log
        verify(auditService).log(eq(3L), eq("TRIAGE_ASSESSED"), eq("TriageRecord"), eq(100L), anyString());
    }
}
