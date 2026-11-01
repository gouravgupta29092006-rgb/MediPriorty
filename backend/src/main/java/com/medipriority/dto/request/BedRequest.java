package com.medipriority.dto.request;

import com.medipriority.model.Bed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BedRequest(
        @NotNull Long departmentId,
        @NotBlank String bedNumber,
        @NotNull Bed.BedType bedType
) {}
