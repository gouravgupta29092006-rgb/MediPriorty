package com.medipriority.dsa.heap;

import java.time.LocalDateTime;

/**
 * Entry in the patient priority queue.
 *
 * <p>Priority ordering (min-heap, lower value = higher urgency):
 * <ol>
 *   <li>priorityValue: RED=1, ORANGE=2, YELLOW=3, GREEN=4</li>
 *   <li>registeredAt: earlier timestamp = higher priority</li>
 *   <li>requestId: lower ID = higher priority (deterministic)</li>
 * </ol>
 *
 * <p>Each entry carries a version counter. When a patient is reassessed,
 * a new entry with an incremented version is inserted and the old entry
 * is marked as superseded in the version registry.
 */
public class QueueEntry implements Comparable<QueueEntry> {

    private final long requestId;
    private final int priorityValue;        // 1=RED, 2=ORANGE, 3=YELLOW, 4=GREEN
    private final LocalDateTime registeredAt;
    private final int version;

    public QueueEntry(long requestId, int priorityValue,
                      LocalDateTime registeredAt, int version) {
        this.requestId = requestId;
        this.priorityValue = priorityValue;
        this.registeredAt = registeredAt;
        this.version = version;
    }

    // ---- Getters ----

    public long getRequestId() {
        return requestId;
    }

    public int getPriorityValue() {
        return priorityValue;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public int getVersion() {
        return version;
    }

    /**
     * Comparator for min-heap ordering.
     * Lower priorityValue = higher urgency = closer to heap root.
     *
     * @param other the entry to compare to
     * @return negative if this is higher priority, positive if lower
     */
    @Override
    public int compareTo(QueueEntry other) {
        // 1. Clinical urgency (lower value = more urgent)
        if (this.priorityValue != other.priorityValue) {
            return Integer.compare(this.priorityValue, other.priorityValue);
        }
        // 2. Registration time (earlier = more urgent)
        int timeCompare = this.registeredAt.compareTo(other.registeredAt);
        if (timeCompare != 0) {
            return timeCompare;
        }
        // 3. Request ID (lower = more urgent, deterministic tie-break)
        return Long.compare(this.requestId, other.requestId);
    }

    @Override
    public String toString() {
        return "QueueEntry{requestId=" + requestId +
               ", priority=" + priorityValue +
               ", version=" + version + "}";
    }
}
