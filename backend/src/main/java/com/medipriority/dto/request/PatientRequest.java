package com.medipriority.dto.request;

import com.medipriority.model.Patient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientRequest(
        @NotBlank @Size(max = 150) String fullName,
        LocalDate dateOfBirth,
        Patient.Gender gender,
        @Size(max = 20) String contactNumber,
        @Size(max = 255) String emergencyContact
) {}
