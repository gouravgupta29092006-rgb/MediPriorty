package com.medipriority.controller;

import com.medipriority.dto.request.BedRequest;
import com.medipriority.dto.request.StatusUpdateRequest;
import com.medipriority.dto.response.BedResponse;
import com.medipriority.model.Bed;
import com.medipriority.service.BedService;
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
@RequestMapping("/api/beds")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BedResponse> create(@Valid @RequestBody BedRequest req) {
        BedResponse response = bedService.create(req, SecurityUtil.getCurrentUserId());
        return ResponseEntity.created(URI.create("/api/beds/" + response.bedId()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<Page<BedResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bedNumber").ascending());
        return ResponseEntity.ok(bedService.findAll(pageable));
    }

    @GetMapping("/available")
    public ResponseEntity<List<BedResponse>> findAvailable(
            @RequestParam(required = false, defaultValue = "GENERAL") Bed.BedType type) {
        return ResponseEntity.ok(bedService.findAvailableByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BedResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.findById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<BedResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest req) {
        Bed.BedStatus status = Bed.BedStatus.valueOf(req.status());
        return ResponseEntity.ok(bedService.updateStatus(id, status, SecurityUtil.getCurrentUserId()));
    }
}
