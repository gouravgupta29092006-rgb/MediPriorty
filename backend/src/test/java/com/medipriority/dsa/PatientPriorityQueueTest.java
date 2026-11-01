package com.medipriority.dsa;

import com.medipriority.dsa.heap.PatientPriorityQueue;
import com.medipriority.dsa.heap.QueueEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PatientPriorityQueue — Min-Heap DSA Tests")
class PatientPriorityQueueTest {

    private PatientPriorityQueue pq;
    private final LocalDateTime now = LocalDateTime.now();

    @BeforeEach
    void setUp() {
        pq = new PatientPriorityQueue(8);
    }

    @Test
    @DisplayName("Should extract entries in strict priority order (RED=1, ORANGE=2, YELLOW=3, GREEN=4)")
    void testPriorityOrder() {
        pq.insert(new QueueEntry(104L, 4, now.plusMinutes(1), 1)); // GREEN
        pq.insert(new QueueEntry(102L, 2, now.plusMinutes(2), 1)); // ORANGE
        pq.insert(new QueueEntry(101L, 1, now.plusMinutes(3), 1)); // RED
        pq.insert(new QueueEntry(103L, 3, now.plusMinutes(4), 1)); // YELLOW

        assertEquals(4, pq.size());

        assertEquals(101L, pq.extractMin().getRequestId()); // RED
        assertEquals(102L, pq.extractMin().getRequestId()); // ORANGE
        assertEquals(103L, pq.extractMin().getRequestId()); // YELLOW
        assertEquals(104L, pq.extractMin().getRequestId()); // GREEN
        assertTrue(pq.isEmpty());
    }

    @Test
    @DisplayName("Should break priority ties using earlier registration timestamp")
    void testTimestampTieBreaker() {
        LocalDateTime t1 = now.minusMinutes(10);
        LocalDateTime t2 = now.minusMinutes(5);

        pq.insert(new QueueEntry(202L, 2, t2, 1)); // ORANGE, registered 5 min ago
        pq.insert(new QueueEntry(201L, 2, t1, 1)); // ORANGE, registered 10 min ago (earlier)

        QueueEntry first = pq.extractMin();
        assertEquals(201L, first.getRequestId(), "Earlier patient should be prioritized on tie");
    }

    @Test
    @DisplayName("Should break timestamp ties deterministically using lower requestId")
    void testRequestIdDeterministicTieBreaker() {
        pq.insert(new QueueEntry(305L, 1, now, 1));
        pq.insert(new QueueEntry(302L, 1, now, 1));
        pq.insert(new QueueEntry(308L, 1, now, 1));

        assertEquals(302L, pq.extractMin().getRequestId());
        assertEquals(305L, pq.extractMin().getRequestId());
        assertEquals(308L, pq.extractMin().getRequestId());
    }

    @Test
    @DisplayName("Should safely handle clinical reassessment using versioning")
    void testReassessmentVersioning() {
        // Patient initially YELLOW (priority 3, version 1)
        pq.insert(new QueueEntry(401L, 3, now, 1));
        // Condition deteriorates to RED (priority 1)
        pq.updatePriority(401L, 1, now);

        // Another patient is ORANGE (priority 2)
        pq.insert(new QueueEntry(402L, 2, now.minusMinutes(2), 1));

        // 401 should now be served first because it was upgraded to RED (priority 1)
        QueueEntry next = pq.extractMin();
        assertEquals(401L, next.getRequestId());
        assertEquals(1, next.getPriorityValue());

        assertEquals(402L, pq.extractMin().getRequestId());
        // Extracting once more will discard the stale version 1 of 401 and return null
        assertNull(pq.extractMin());
        assertTrue(pq.isEmpty());
    }

    @Test
    @DisplayName("Should invalidate patient from queue when treated or cancelled")
    void testInvalidation() {
        pq.insert(new QueueEntry(501L, 1, now, 1));
        pq.insert(new QueueEntry(502L, 2, now, 1));

        pq.invalidate(501L);

        assertEquals(502L, pq.extractMin().getRequestId());
        assertTrue(pq.isEmpty());
    }

    @Test
    @DisplayName("Should dynamically resize when capacity is exceeded")
    void testDynamicResizing() {
        // Initial capacity was 8
        for (int i = 1; i <= 25; i++) {
            pq.insert(new QueueEntry((long) i, (i % 4) + 1, now.plusSeconds(i), 1));
        }
        assertEquals(25, pq.size());

        long prevPriority = 0;
        while (!pq.isEmpty()) {
            QueueEntry e = pq.extractMin();
            assertTrue(e.getPriorityValue() >= prevPriority);
            prevPriority = e.getPriorityValue();
        }
    }

    @Test
    @DisplayName("Should rebuild queue from list in O(n) heapify")
    void testRebuild() {
        List<QueueEntry> entries = List.of(
                new QueueEntry(601L, 4, now, 1),
                new QueueEntry(602L, 1, now, 1),
                new QueueEntry(603L, 2, now, 1)
        );

        pq.rebuild(entries);
        assertEquals(3, pq.size());
        assertEquals(602L, pq.extractMin().getRequestId());
        assertEquals(603L, pq.extractMin().getRequestId());
        assertEquals(601L, pq.extractMin().getRequestId());
    }
}
