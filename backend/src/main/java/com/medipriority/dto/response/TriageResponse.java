package com.medipriority.dto.response;

import com.medipriority.model.TriageRecord;

import java.time.LocalDateTime;

public record TriageResponse(
        Long triageId,
        Long requestId,
        String requestNumber,
        String patientName,
        TriageRecord.TriageCategory triageCategory,
        int priorityValue,
        String clinicalNotes,
        String vitalSignsJson,
        int assessmentVersion,
        String medicalOfficerName,
        LocalDateTime assessedAt
) {}
