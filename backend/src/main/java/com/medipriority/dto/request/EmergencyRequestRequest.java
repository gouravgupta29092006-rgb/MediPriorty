package com.medipriority.dto.request;

import com.medipriority.model.EmergencyRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record EmergencyRequestRequest(
        @NotNull Long patientId,
        @NotBlank @Size(max = 500) String pickupLocation,
        BigDecimal pickupLatitude,
        BigDecimal pickupLongitude,
        EmergencyRequest.BedType requiredBedType
) {}
