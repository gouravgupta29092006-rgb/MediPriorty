package com.medipriority.service;

import com.medipriority.dto.response.QueueEntryResponse;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.Patient;
import com.medipriority.model.TriageRecord;
import com.medipriority.repository.EmergencyRequestRepository;
import com.medipriority.repository.TriageRecordRepository;
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
@DisplayName("PriorityQueueService Lifecycle & Eligibility Unit Tests")
class PriorityQueueLifecycleTest {

    @Mock
    private EmergencyRequestRepository requestRepository;

    @Mock
    private TriageRecordRepository triageRecordRepository;

    @InjectMocks
    private PriorityQueueService priorityQueueService;

    private Patient patient1;
    private Patient patient2;
    private Patient patient3;

    @BeforeEach
    void setUp() {
        patient1 = Patient.builder().patientId(1L).fullName("Naman Sharma").build();
        patient2 = Patient.builder().patientId(2L).fullName("Alice Smith").build();
        patient3 = Patient.builder().patientId(3L).fullName("Bob Jones").build();
    }

    @Test
    @DisplayName("Empty database returns empty priority queue")
    void testEmptyQueueReturnsEmptyList() {
        when(requestRepository.findQueueEligibleRequests(anyList())).thenReturn(List.of());

        List<QueueEntryResponse> queue = priorityQueueService.getOrderedQueue();

        assertNotNull(queue);
        assertTrue(queue.isEmpty());
        assertEquals(0, queue.size());
    }

    @Test
    @DisplayName("Closed and discharged requests are excluded from priority queue")
    void testClosedAndDischargedRequestsExcludedFromQueue() {
        // Naman is CLOSED (discharged), Alice is TRIAGED
        EmergencyRequest closedReq = EmergencyRequest.builder()
                .requestId(101L)
                .requestNumber("REQ-001")
                .patient(patient1)
                .requestStatus(EmergencyRequest.RequestStatus.CLOSED)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        EmergencyRequest activeReq = EmergencyRequest.builder()
                .requestId(102L)
                .requestNumber("REQ-002")
                .patient(patient2)
                .requestStatus(EmergencyRequest.RequestStatus.TRIAGED)
                .createdAt(LocalDateTime.now().minusMinutes(30))
                .build();

        // Repository findQueueEligibleRequests only returns active eligible requests
        when(requestRepository.findQueueEligibleRequests(anyList())).thenReturn(List.of(activeReq));

        TriageRecord activeTriage = TriageRecord.builder()
                .triageId(1L)
                .emergencyRequest(activeReq)
                .triageCategory(TriageRecord.TriageCategory.RED)
                .assessmentVersion(1)
                .build();

        when(triageRecordRepository.findLatestByRequestId(102L)).thenReturn(Optional.of(activeTriage));
        when(requestRepository.findById(102L)).thenReturn(Optional.of(activeReq));

        List<QueueEntryResponse> queue = priorityQueueService.getOrderedQueue();

        assertEquals(1, queue.size());
        assertEquals("Alice Smith", queue.get(0).patientName());
        assertEquals("REQ-002", queue.get(0).requestNumber());
        assertEquals(TriageRecord.TriageCategory.RED, queue.get(0).triageCategory());

        // Verify CLOSED request is never returned
        boolean hasClosed = queue.stream().anyMatch(q -> q.requestId() == 101L || "CLOSED".equals(q.requestStatus()));
        assertFalse(hasClosed, "Closed request must never appear in the priority queue");
    }

    @Test
    @DisplayName("Admitted and cancelled requests are excluded from priority queue")
    void testAdmittedAndCancelledRequestsExcluded() {
        EmergencyRequest admittedReq = EmergencyRequest.builder()
                .requestId(201L)
                .requestNumber("REQ-201")
                .patient(patient1)
                .requestStatus(EmergencyRequest.RequestStatus.ADMITTED)
                .build();

        EmergencyRequest cancelledReq = EmergencyRequest.builder()
                .requestId(202L)
                .requestNumber("REQ-202")
                .patient(patient3)
                .requestStatus(EmergencyRequest.RequestStatus.CANCELLED)
                .build();

        assertFalse(admittedReq.isQueueEligible(), "Admitted request must not be queue-eligible");
        assertFalse(cancelledReq.isQueueEligible(), "Cancelled request must not be queue-eligible");

        when(requestRepository.findQueueEligibleRequests(anyList())).thenReturn(List.of());

        List<QueueEntryResponse> queue = priorityQueueService.getOrderedQueue();
        assertTrue(queue.isEmpty());
    }

    @Test
    @DisplayName("Ordering strictly follows clinical urgency RED (1) > ORANGE (2) > YELLOW (3) > GREEN (4)")
    void testClinicalUrgencyOrdering() {
        LocalDateTime baseTime = LocalDateTime.now();

        EmergencyRequest yellowReq = EmergencyRequest.builder()
                .requestId(301L)
                .requestNumber("REQ-301")
                .patient(patient1)
                .requestStatus(EmergencyRequest.RequestStatus.TRIAGED)
                .createdAt(baseTime.minusMinutes(40))
                .build();

        EmergencyRequest redReq = EmergencyRequest.builder()
                .requestId(302L)
                .requestNumber("REQ-302")
                .patient(patient2)
                .requestStatus(EmergencyRequest.RequestStatus.TRIAGED)
                .createdAt(baseTime.minusMinutes(10)) // Arrived later, but higher urgency
                .build();

        EmergencyRequest orangeReq = EmergencyRequest.builder()
                .requestId(303L)
                .requestNumber("REQ-303")
                .patient(patient3)
                .requestStatus(EmergencyRequest.RequestStatus.TRIAGED)
                .createdAt(baseTime.minusMinutes(20))
                .build();

        when(requestRepository.findQueueEligibleRequests(anyList()))
                .thenReturn(List.of(yellowReq, redReq, orangeReq));

        TriageRecord yellowTriage = TriageRecord.builder()
                .emergencyRequest(yellowReq).triageCategory(TriageRecord.TriageCategory.YELLOW).assessmentVersion(1).build();
        TriageRecord redTriage = TriageRecord.builder()
                .emergencyRequest(redReq).triageCategory(TriageRecord.TriageCategory.RED).assessmentVersion(1).build();
        TriageRecord orangeTriage = TriageRecord.builder()
                .emergencyRequest(orangeReq).triageCategory(TriageRecord.TriageCategory.ORANGE).assessmentVersion(1).build();

        when(triageRecordRepository.findLatestByRequestId(301L)).thenReturn(Optional.of(yellowTriage));
        when(triageRecordRepository.findLatestByRequestId(302L)).thenReturn(Optional.of(redTriage));
        when(triageRecordRepository.findLatestByRequestId(303L)).thenReturn(Optional.of(orangeTriage));

        when(requestRepository.findById(301L)).thenReturn(Optional.of(yellowReq));
        when(requestRepository.findById(302L)).thenReturn(Optional.of(redReq));
        when(requestRepository.findById(303L)).thenReturn(Optional.of(orangeReq));

        List<QueueEntryResponse> queue = priorityQueueService.getOrderedQueue();

        assertEquals(3, queue.size());
        assertEquals("REQ-302", queue.get(0).requestNumber(), "RED must rank first");
        assertEquals("REQ-303", queue.get(1).requestNumber(), "ORANGE must rank second");
        assertEquals("REQ-301", queue.get(2).requestNumber(), "YELLOW must rank third");
    }

    @Test
    @DisplayName("Ties in clinical urgency are broken by registration timestamp (earlier first)")
    void testTieBreakingRegistrationTimestamp() {
        LocalDateTime t1 = LocalDateTime.now().minusMinutes(30);
        LocalDateTime t2 = LocalDateTime.now().minusMinutes(15);

        EmergencyRequest firstArrival = EmergencyRequest.builder()
                .requestId(401L)
                .requestNumber("REQ-401")
                .patient(patient1)
                .requestStatus(EmergencyRequest.RequestStatus.TRIAGED)
                .createdAt(t1)
                .build();

        EmergencyRequest secondArrival = EmergencyRequest.builder()
                .requestId(402L)
                .requestNumber("REQ-402")
                .patient(patient2)
                .requestStatus(EmergencyRequest.RequestStatus.TRIAGED)
                .createdAt(t2)
                .build();

        when(requestRepository.findQueueEligibleRequests(anyList()))
                .thenReturn(List.of(secondArrival, firstArrival));

        TriageRecord triage1 = TriageRecord.builder()
                .emergencyRequest(firstArrival).triageCategory(TriageRecord.TriageCategory.RED).assessmentVersion(1).build();
        TriageRecord triage2 = TriageRecord.builder()
                .emergencyRequest(secondArrival).triageCategory(TriageRecord.TriageCategory.RED).assessmentVersion(1).build();

        when(triageRecordRepository.findLatestByRequestId(401L)).thenReturn(Optional.of(triage1));
        when(triageRecordRepository.findLatestByRequestId(402L)).thenReturn(Optional.of(triage2));

        when(requestRepository.findById(401L)).thenReturn(Optional.of(firstArrival));
        when(requestRepository.findById(402L)).thenReturn(Optional.of(secondArrival));

        List<QueueEntryResponse> queue = priorityQueueService.getOrderedQueue();

        assertEquals(2, queue.size());
        assertEquals("REQ-401", queue.get(0).requestNumber(), "Earlier arrival must win tie");
        assertEquals("REQ-402", queue.get(1).requestNumber(), "Later arrival must rank second");
    }

    @Test
    @DisplayName("Lifecycle change invalidates discharged request and synchronizes queue")
    void testLifecycleChangeEvictsDischargedPatient() {
        when(requestRepository.findQueueEligibleRequests(anyList())).thenReturn(List.of());

        priorityQueueService.handleRequestLifecycleChange(101L);

        List<QueueEntryResponse> queue = priorityQueueService.getOrderedQueue();
        assertTrue(queue.isEmpty());
        verify(requestRepository, atLeastOnce()).findQueueEligibleRequests(anyList());
    }
}

