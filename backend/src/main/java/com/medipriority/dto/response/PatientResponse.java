package com.medipriority.dto.response;

import com.medipriority.model.Patient;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientResponse(
        Long patientId,
        String fullName,
        LocalDate dateOfBirth,
        Patient.Gender gender,
        String contactNumber,
        String emergencyContact,
        LocalDateTime createdAt
) {}
