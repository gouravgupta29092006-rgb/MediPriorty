package com.medipriority.dto.response;

import com.medipriority.model.Ambulance;

import java.time.LocalDateTime;

public record AmbulanceResponse(
        Long ambulanceId,
        String registrationNumber,
        Ambulance.AmbulanceType ambulanceType,
        Ambulance.EquipmentLevel equipmentLevel,
        int availableMedicalPersonnel,
        Ambulance.AmbulanceStatus currentStatus,
        Long currentNodeId,
        String currentNodeName,
        LocalDateTime updatedAt
) {}
