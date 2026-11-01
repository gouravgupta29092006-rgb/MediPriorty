package com.medipriority.dto.response;

import com.medipriority.dsa.heap.QueueEntry;
import com.medipriority.model.TriageRecord;

import java.time.LocalDateTime;

/**
 * Priority queue entry response — one row in the queue view.
 */
public record QueueEntryResponse(
        Long requestId,
        String requestNumber,
        String patientName,
        TriageRecord.TriageCategory triageCategory,
        int priorityValue,
        String requestStatus,
        LocalDateTime registeredAt,
        int version
) {}
