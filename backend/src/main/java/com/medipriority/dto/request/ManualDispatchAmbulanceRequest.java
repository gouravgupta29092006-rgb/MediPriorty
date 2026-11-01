package com.medipriority.dto.request;

import jakarta.validation.constraints.NotNull;

public record ManualDispatchAmbulanceRequest(
        @NotNull(message = "requestId is required") Long requestId,
        @NotNull(message = "ambulanceId is required") Long ambulanceId
) {}
