package com.medipriority.dto.response;

import com.medipriority.model.BedAllocation;

import java.time.LocalDateTime;

public record BedAllocationResponse(
        Long allocationId,
        Long requestId,
        String requestNumber,
        String patientName,
        Long bedId,
        String bedNumber,
        String bedType,
        String departmentName,
        String allocatedByName,
        BedAllocation.AllocationStatus status,
        LocalDateTime reservedAt,
        LocalDateTime admittedAt,
        LocalDateTime releasedAt,
        LocalDateTime createdAt
) {}
