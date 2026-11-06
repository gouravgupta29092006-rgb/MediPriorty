package com.medipriority.dto.response;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        long totalActiveRequests,
        long criticalPatients,
        long waitingPatients,
        long availableAmbulances,
        long dispatchedAmbulances,
        long onSceneAmbulances,
        long returningAmbulances,
        long reservedAmbulances,
        long maintenanceAmbulances,
        long availableBeds,
        long occupiedBeds,
        long totalBeds,
        Map<String, Long> triageCategoryDistribution,
        Map<String, Long> bedTypeAvailability,
        Map<String, Long> bedTypeOccupied,
        List<DepartmentBedStats> departmentBeds
) {}
