package com.medipriority.service;

import com.medipriority.dto.response.BedAllocationResponse;
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
@DisplayName("BedAllocationService Unit Tests")
class BedAllocationServiceTest {

    @Mock
    private BedAllocationRepository bedAllocationRepository;
    @Mock
    private BedRepository bedRepository;
    @Mock
    private EmergencyRequestRepository requestRepository;
    @Mock
    private TriageRecordRepository triageRecordRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditService auditService;
    @Mock
    private PriorityQueueService priorityQueueService;

    @InjectMocks
    private BedAllocationService bedAllocationService;

    private EmergencyRequest emergencyRequest;
    private Bed bed;
    private User doctor;
    private HospitalDepartment department;

    @BeforeEach
    void setUp() {
        department = HospitalDepartment.builder()
                .departmentId(2L)
                .departmentName("Intensive Care Unit (ICU)")
                .build();

        Patient patient = Patient.builder().patientId(1L).fullName("John Doe").build();

        emergencyRequest = EmergencyRequest.builder()
                .requestId(10L)
                .requestNumber("REQ-20261101-0001")
                .requestStatus(EmergencyRequest.RequestStatus.ARRIVED)
                .requiredBedType(EmergencyRequest.BedType.ICU)
                .patient(patient)
                .createdAt(LocalDateTime.now())
                .build();

        bed = Bed.builder()
                .bedId(1L)
                .bedNumber("ICU-101")
                .bedType(Bed.BedType.ICU)
                .department(department)
                .status(Bed.BedStatus.AVAILABLE)
                .build();

        doctor = User.builder()
                .userId(3L)
                .fullName("Dr. Sarah Connor")
                .role(User.Role.MEDICAL_OFFICER)
                .build();
    }

    @Test
    @DisplayName("Should auto-assign available ICU bed and update bed/request statuses")
    void testAutoAssignBedSuccess() {
        when(requestRepository.findById(10L)).thenReturn(Optional.of(emergencyRequest));
        when(bedAllocationRepository.existsByEmergencyRequest_RequestIdAndStatus(10L, BedAllocation.AllocationStatus.ACTIVE))
                .thenReturn(false);
        when(bedRepository.findAvailableByType(Bed.BedStatus.AVAILABLE, Bed.BedType.ICU))
                .thenReturn(List.of(bed));
        when(bedRepository.findByIdWithLock(1L)).thenReturn(Optional.of(bed));
        when(userRepository.findById(3L)).thenReturn(Optional.of(doctor));

        BedAllocation allocation = BedAllocation.builder()
                .allocationId(600L)
                .emergencyRequest(emergencyRequest)
                .bed(bed)
                .allocatedBy(doctor)
                .reservedAt(LocalDateTime.now())
                .status(BedAllocation.AllocationStatus.ACTIVE)
                .build();

        when(bedAllocationRepository.save(any(BedAllocation.class))).thenReturn(allocation);

        BedAllocationResponse res = bedAllocationService.autoAssign(10L, 3L);

        assertNotNull(res);
        assertEquals(600L, res.allocationId());
        assertEquals(Bed.BedStatus.RESERVED, bed.getStatus());
        assertEquals(EmergencyRequest.RequestStatus.BED_RESERVED, emergencyRequest.getRequestStatus());

        verify(bedRepository).save(bed);
        verify(requestRepository).save(emergencyRequest);
        verify(auditService).log(eq(3L), eq("BED_RESERVED"), eq("BedAllocation"), eq(600L), anyString());
    }

    @Test
    @DisplayName("Should fail when no beds of requested type are available")
    void testNoBedsAvailableThrows() {
        when(requestRepository.findById(10L)).thenReturn(Optional.of(emergencyRequest));
        when(bedAllocationRepository.existsByEmergencyRequest_RequestIdAndStatus(10L, BedAllocation.AllocationStatus.ACTIVE))
                .thenReturn(false);
        when(bedRepository.findAvailableByType(Bed.BedStatus.AVAILABLE, Bed.BedType.ICU))
                .thenReturn(List.of());

        assertThrows(AllocationFailedException.class, () ->
                bedAllocationService.autoAssign(10L, 3L));
    }

    @Test
    @DisplayName("Should admit patient to reserved bed transitioning to OCCUPIED and ADMITTED")
    void testAdmitPatient() {
        BedAllocation allocation = BedAllocation.builder()
                .allocationId(600L)
                .emergencyRequest(emergencyRequest)
                .bed(bed)
                .allocatedBy(doctor)
                .status(BedAllocation.AllocationStatus.ACTIVE)
                .build();

        when(bedAllocationRepository.findById(600L)).thenReturn(Optional.of(allocation));
        when(bedAllocationRepository.save(any(BedAllocation.class))).thenReturn(allocation);

        BedAllocationResponse res = bedAllocationService.admit(600L, 3L);

        assertEquals(Bed.BedStatus.OCCUPIED, bed.getStatus());
        assertEquals(EmergencyRequest.RequestStatus.ADMITTED, emergencyRequest.getRequestStatus());
        verify(bedRepository).save(bed);
        verify(requestRepository).save(emergencyRequest);
        verify(auditService).log(eq(3L), eq("PATIENT_ADMITTED"), eq("BedAllocation"), eq(600L), isNull());
    }
}
