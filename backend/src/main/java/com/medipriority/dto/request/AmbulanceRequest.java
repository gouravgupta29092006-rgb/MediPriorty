package com.medipriority.dto.request;

import com.medipriority.model.Ambulance;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AmbulanceRequest(
        @NotBlank @Size(max = 50) String registrationNumber,
        @NotNull Ambulance.AmbulanceType ambulanceType,
        @NotNull Ambulance.EquipmentLevel equipmentLevel,
        int availableMedicalPersonnel,
        Long currentNodeId
) {}
