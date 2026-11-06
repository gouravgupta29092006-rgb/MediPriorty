package com.medipriority.dto.response;

/**
 * Department-level bed availability statistics for analytics.
 */
public record DepartmentBedStats(
        String departmentName,
        long availableBeds,
        long occupiedBeds,
        long totalBeds
) {}
