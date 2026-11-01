package com.medipriority.dto.response;

import java.util.Map;

public record DashboardResponse(
        long totalActiveRequests,
        long criticalPatients,
        long waitingPatients,
        long availableAmbulances,
        long dispatchedAmbulances,
        long availableBeds,
        long occupiedBeds,
        long totalBeds,
        Map<String, Long> triageCategoryDistribution,
        Map<String, Long> bedTypeAvailability
) {}
