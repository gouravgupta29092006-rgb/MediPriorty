package com.medipriority.dto.response;

import com.medipriority.model.Bed;

import java.time.LocalDateTime;

public record BedResponse(
        Long bedId,
        String bedNumber,
        Bed.BedType bedType,
        Bed.BedStatus status,
        Long departmentId,
        String departmentName,
        LocalDateTime updatedAt
) {}
