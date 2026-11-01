package com.medipriority.controller;

import com.medipriority.dto.request.AmbulanceRequest;
import com.medipriority.dto.request.StatusUpdateRequest;
import com.medipriority.dto.response.AmbulanceResponse;
import com.medipriority.model.Ambulance;
import com.medipriority.service.AmbulanceService;
import com.medipriority.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/ambulances")
@RequiredArgsConstructor
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<AmbulanceResponse> create(@Valid @RequestBody AmbulanceRequest req) {
        AmbulanceResponse response = ambulanceService.create(req, SecurityUtil.getCurrentUserId());
        return ResponseEntity.created(URI.create("/api/ambulances/" + response.ambulanceId()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<Page<AmbulanceResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("registrationNumber").ascending());
        return ResponseEntity.ok(ambulanceService.findAll(pageable));
    }

    @GetMapping("/available")
    public ResponseEntity<List<AmbulanceResponse>> findAvailable() {
        return ResponseEntity.ok(ambulanceService.findAvailable());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmbulanceResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ambulanceService.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<AmbulanceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AmbulanceRequest req) {
        return ResponseEntity.ok(ambulanceService.update(id, req, SecurityUtil.getCurrentUserId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPATCHER')")
    public ResponseEntity<AmbulanceResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest req) {
        Ambulance.AmbulanceStatus status = Ambulance.AmbulanceStatus.valueOf(req.status());
        return ResponseEntity.ok(ambulanceService.updateStatus(id, status, SecurityUtil.getCurrentUserId()));
    }
}
