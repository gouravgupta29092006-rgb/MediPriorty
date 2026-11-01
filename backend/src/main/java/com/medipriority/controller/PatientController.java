package com.medipriority.controller;

import com.medipriority.dto.request.PatientRequest;
import com.medipriority.dto.response.PatientResponse;
import com.medipriority.service.PatientService;
import com.medipriority.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<PatientResponse> create(@Valid @RequestBody PatientRequest req) {
        PatientResponse response = patientService.create(req, SecurityUtil.getCurrentUserId());
        return ResponseEntity.created(URI.create("/api/patients/" + response.patientId()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<Page<PatientResponse>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(patientService.findAll(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody PatientRequest req) {
        return ResponseEntity.ok(patientService.update(id, req, SecurityUtil.getCurrentUserId()));
    }
}
