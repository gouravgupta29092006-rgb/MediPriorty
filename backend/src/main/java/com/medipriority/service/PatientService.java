package com.medipriority.service;

import com.medipriority.dto.request.PatientRequest;
import com.medipriority.dto.response.PatientResponse;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.Patient;
import com.medipriority.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final AuditService auditService;

    @Transactional
    public PatientResponse create(PatientRequest req, Long actingUserId) {
        Patient patient = Patient.builder()
                .fullName(req.fullName())
                .dateOfBirth(req.dateOfBirth())
                .gender(req.gender())
                .contactNumber(req.contactNumber())
                .emergencyContact(req.emergencyContact())
                .build();
        Patient saved = patientRepository.save(patient);
        auditService.log(actingUserId, "PATIENT_CREATED", "Patient", saved.getPatientId(), null);
        return toResponse(saved);
    }

    public Page<PatientResponse> findAll(String search, Pageable pageable) {
        return patientRepository.findBySearch(search, pageable).map(this::toResponse);
    }

    public PatientResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public PatientResponse update(Long id, PatientRequest req, Long actingUserId) {
        Patient patient = getOrThrow(id);
        patient.setFullName(req.fullName());
        patient.setDateOfBirth(req.dateOfBirth());
        patient.setGender(req.gender());
        patient.setContactNumber(req.contactNumber());
        patient.setEmergencyContact(req.emergencyContact());
        auditService.log(actingUserId, "PATIENT_UPDATED", "Patient", id, null);
        return toResponse(patientRepository.save(patient));
    }

    public Patient getOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }

    private PatientResponse toResponse(Patient p) {
        return new PatientResponse(p.getPatientId(), p.getFullName(), p.getDateOfBirth(),
                p.getGender(), p.getContactNumber(), p.getEmergencyContact(), p.getCreatedAt());
    }
}
