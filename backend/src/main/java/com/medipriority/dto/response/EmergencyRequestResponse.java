package com.medipriority.dto.response;

import com.medipriority.model.EmergencyRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EmergencyRequestResponse(
        Long requestId,
        String requestNumber,
        EmergencyRequest.RequestStatus requestStatus,
        Long patientId,
        String patientName,
        String pickupLocation,
        BigDecimal pickupLatitude,
        BigDecimal pickupLongitude,
        EmergencyRequest.BedType requiredBedType,
        String currentTriageCategory,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
