package com.medipriority.dto.request;

import com.medipriority.model.TriageRecord;
import jakarta.validation.constraints.NotNull;

public record TriageRequest(
        @NotNull Long requestId,
        @NotNull TriageRecord.TriageCategory triageCategory,
        String clinicalNotes,
        String vitalSignsJson
) {}
