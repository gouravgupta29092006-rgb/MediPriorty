package com.medipriority.service;

import com.medipriority.dto.response.AmbulanceAllocationResponse;
import com.medipriority.exception.AllocationFailedException;
import com.medipriority.exception.ResourceConflictException;
import com.medipriority.model.*;
import com.medipriority.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AmbulanceAllocationService Unit Tests")
class AmbulanceAllocationServiceTest {

    @Mock
    private AmbulanceAllocationRepository allocationRepository;
    @Mock
    private AmbulanceRepository ambulanceRepository;
    @Mock
    private EmergencyRequestRepository requestRepository;
    @Mock
    private TriageRecordRepository triageRecordRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoadNetworkService roadNetworkService;
    @Mock
    private PriorityQueueService priorityQueueService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private AmbulanceAllocationService ambulanceAllocationService;

    private EmergencyRequest emergencyRequest;
    private TriageRecord triageRecord;
    private Ambulance ambulance;
    private User dispatcher;

    @BeforeEach
    void setUp() {
        Patient patient = Patient.builder().patientId(1L).fullName("John Doe").build();

        emergencyRequest = EmergencyRequest.builder()
                .requestId(10L)
                .requestNumber("REQ-20261101-0001")
                .requestStatus(EmergencyRequest.RequestStatus.TRIAGED)
                .patient(patient)
                .createdAt(LocalDateTime.now())
                .build();

        triageRecord = TriageRecord.builder()
                .triageId(100L)
                .emergencyRequest(emergencyRequest)
                .triageCategory(TriageRecord.TriageCategory.RED)
                .build();

        ambulance = Ambulance.builder()
                .ambulanceId(1L)
                .registrationNumber("MED-AMB-01")
                .ambulanceType(Ambulance.AmbulanceType.ADVANCED)
                .equipmentLevel(Ambulance.EquipmentLevel.ALS)
                .currentStatus(Ambulance.AmbulanceStatus.AVAILABLE)
                .build();

        dispatcher = User.builder()
                .userId(2L)
                .fullName("Chief Dispatcher")
                .role(User.Role.DISPATCHER)
                .build();
    }

    @Test
    @DisplayName("Should auto-dispatch best ambulance with locking and audit logging")
    void testAutoDispatchSuccess() {
        when(requestRepository.findById(10L)).thenReturn(Optional.of(emergencyRequest));
        when(allocationRepository.existsByEmergencyRequest_RequestIdAndStatus(10L, AmbulanceAllocation.AllocationStatus.ACTIVE))
                .thenReturn(false);
        when(triageRecordRepository.findLatestByRequestId(10L)).thenReturn(Optional.of(triageRecord));
        when(ambulanceRepository.findByCurrentStatus(Ambulance.AmbulanceStatus.AVAILABLE))
                .thenReturn(List.of(ambulance));
        when(ambulanceRepository.findByIdWithLock(1L)).thenReturn(Optional.of(ambulance));
        when(userRepository.findById(2L)).thenReturn(Optional.of(dispatcher));

        AmbulanceAllocation allocation = AmbulanceAllocation.builder()
                .allocationId(500L)
                .emergencyRequest(emergencyRequest)
                .ambulance(ambulance)
                .allocatedBy(dispatcher)
                .dispatchTime(LocalDateTime.now())
                .status(AmbulanceAllocation.AllocationStatus.ACTIVE)
                .build();

        when(allocationRepository.save(any(AmbulanceAllocation.class))).thenReturn(allocation);

        AmbulanceAllocationResponse response = ambulanceAllocationService.autoDispatch(10L, 2L);

        assertNotNull(response);
        assertEquals(500L, response.allocationId());
        assertEquals(Ambulance.AmbulanceStatus.DISPATCHED, ambulance.getCurrentStatus());
        assertEquals(EmergencyRequest.RequestStatus.AMBULANCE_DISPATCHED, emergencyRequest.getRequestStatus());

        verify(ambulanceRepository).save(ambulance);
        verify(requestRepository).save(emergencyRequest);
        verify(auditService).log(eq(2L), eq("AMBULANCE_DISPATCHED"), eq("AmbulanceAllocation"), eq(500L), anyString());
    }

    @Test
    @DisplayName("Should reject dispatch if request is still PENDING_TRIAGE")
    void testRejectUntriagedRequest() {
        emergencyRequest.setRequestStatus(EmergencyRequest.RequestStatus.PENDING_TRIAGE);
        when(requestRepository.findById(10L)).thenReturn(Optional.of(emergencyRequest));

        assertThrows(AllocationFailedException.class, () ->
                ambulanceAllocationService.autoDispatch(10L, 2L));
    }

    @Test
    @DisplayName("Should reject dispatch if request already has an active allocation (HTTP 409 conflict)")
    void testRejectDuplicateActiveAllocation() {
        when(requestRepository.findById(10L)).thenReturn(Optional.of(emergencyRequest));
        when(allocationRepository.existsByEmergencyRequest_RequestIdAndStatus(10L, AmbulanceAllocation.AllocationStatus.ACTIVE))
                .thenReturn(true);

        assertThrows(ResourceConflictException.class, () ->
                ambulanceAllocationService.autoDispatch(10L, 2L));
    }
}
