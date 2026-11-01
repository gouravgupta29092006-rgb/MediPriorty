package com.medipriority.dto.request;

import jakarta.validation.constraints.NotNull;

public record ManualAssignBedRequest(
        @NotNull(message = "requestId is required") Long requestId,
        @NotNull(message = "bedId is required") Long bedId
) {}
