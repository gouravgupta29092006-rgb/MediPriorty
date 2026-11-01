package com.medipriority.dto.response;

import com.medipriority.model.AmbulanceAllocation;

import java.time.LocalDateTime;

public record AmbulanceAllocationResponse(
        Long allocationId,
        Long requestId,
        String requestNumber,
        String patientName,
        Long ambulanceId,
        String registrationNumber,
        String ambulanceType,
        String dispatcherName,
        AmbulanceAllocation.AllocationStatus status,
        LocalDateTime dispatchTime,
        LocalDateTime arrivalTime,
        LocalDateTime completionTime,
        LocalDateTime createdAt
) {}
