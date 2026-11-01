package com.medipriority.dto.request;

import jakarta.validation.constraints.NotBlank;

public record StatusUpdateRequest(
        @NotBlank(message = "status is required") String status
) {}
