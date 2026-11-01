package com.medipriority.service;

import com.medipriority.dsa.heap.PatientPriorityQueue;
import com.medipriority.dsa.heap.QueueEntry;
import com.medipriority.dto.response.QueueEntryResponse;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.TriageRecord;
import com.medipriority.repository.EmergencyRequestRepository;
import com.medipriority.repository.TriageRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * In-memory priority queue service backed by custom binary min-heap.
 *
 * <p>The heap is the computational engine for ordering requests.
 * MySQL is the source of truth for actual resource state.
 *
 * <p>The queue is rebuilt from the database on startup and updated
 * on each triage event. Thread safety is managed with synchronized
 * methods suitable for the expected concurrency level of a single hospital.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PriorityQueueService {

    private final EmergencyRequestRepository requestRepository;
    private final TriageRecordRepository triageRecordRepository;

    private final PatientPriorityQueue queue = new PatientPriorityQueue(64);

    /**
     * Rebuild the priority queue from the database on application startup.
     * Only includes active, triaged requests.
     */
    @PostConstruct
    public synchronized void rebuildFromDatabase() {
        log.info("Rebuilding patient priority queue from database...");
        List<EmergencyRequest> activeRequests = requestRepository.findByRequestStatusIn(
                List.of(EmergencyRequest.RequestStatus.TRIAGED,
                        EmergencyRequest.RequestStatus.AMBULANCE_DISPATCHED,
                        EmergencyRequest.RequestStatus.BED_RESERVED));

        List<QueueEntry> entries = activeRequests.stream()
                .map(er -> {
                    Optional<TriageRecord> latest =
                            triageRecordRepository.findLatestByRequestId(er.getRequestId());
                    return latest.map(triage -> new QueueEntry(
                            er.getRequestId(),
                            triage.getTriageCategory().getPriorityValue(),
                            er.getCreatedAt(),
                            triage.getAssessmentVersion()
                    )).orElse(null);
                })
                .filter(e -> e != null)
                .toList();

        queue.rebuild(entries);
        log.info("Priority queue rebuilt with {} active requests", entries.size());
    }

    /**
     * Insert a new entry or update an existing one (on reassessment).
     */
    public synchronized void insertOrUpdate(long requestId, int priorityValue,
                                             LocalDateTime registeredAt, int version) {
        queue.updatePriority(requestId, priorityValue, registeredAt);
    }

    /**
     * Invalidate a request (removed from dispatch consideration).
     */
    public synchronized void invalidate(long requestId) {
        queue.invalidate(requestId);
    }

    /**
     * Get the ordered priority queue for display.
     * Returns all valid entries in priority order.
     */
    public synchronized List<QueueEntryResponse> getOrderedQueue() {
        List<QueueEntry> entries = queue.getAllValidEntries();
        return entries.stream()
                .map(e -> {
                    EmergencyRequest er = requestRepository.findById(e.getRequestId()).orElse(null);
                    if (er == null) return null;
                    TriageRecord latest = triageRecordRepository
                            .findLatestByRequestId(e.getRequestId()).orElse(null);
                    String category = latest != null ? latest.getTriageCategory().name() : "UNKNOWN";
                    int pv = latest != null ? latest.getTriageCategory().getPriorityValue() : 4;
                    return new QueueEntryResponse(
                            e.getRequestId(),
                            er.getRequestNumber(),
                            er.getPatient().getFullName(),
                            latest != null ? latest.getTriageCategory() : null,
                            pv,
                            er.getRequestStatus().name(),
                            er.getCreatedAt(),
                            e.getVersion()
                    );
                })
                .filter(e -> e != null)
                .toList();
    }

    /**
     * Get the highest priority entry without removing it.
     */
    public synchronized QueueEntry peekHighestPriority() {
        return queue.peek();
    }
}
