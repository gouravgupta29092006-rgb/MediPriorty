package com.medipriority.controller;

import com.medipriority.dto.request.EmergencyRequestRequest;
import com.medipriority.dto.request.StatusUpdateRequest;
import com.medipriority.dto.response.EmergencyRequestResponse;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.service.EmergencyRequestService;
import com.medipriority.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/emergency-requests")
@RequiredArgsConstructor
public class EmergencyRequestController {

    private final EmergencyRequestService requestService;

    @PostMapping
    public ResponseEntity<EmergencyRequestResponse> create(@Valid @RequestBody EmergencyRequestRequest req) {
        EmergencyRequestResponse response = requestService.create(req, SecurityUtil.getCurrentUserId());
        return ResponseEntity.created(URI.create("/api/emergency-requests/" + response.requestId()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<Page<EmergencyRequestResponse>> findAll(
            @RequestParam(required = false) EmergencyRequest.RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(requestService.findAll(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyRequestResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.findById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmergencyRequestResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest req) {
        EmergencyRequest.RequestStatus status = EmergencyRequest.RequestStatus.valueOf(req.status());
        return ResponseEntity.ok(requestService.updateStatus(id, status, SecurityUtil.getCurrentUserId()));
    }
}
