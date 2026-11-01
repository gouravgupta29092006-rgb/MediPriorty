package com.medipriority.dto.request;

import jakarta.validation.constraints.NotNull;

public record AutoDispatchAmbulanceRequest(
        @NotNull(message = "requestId is required") Long requestId
) {}
