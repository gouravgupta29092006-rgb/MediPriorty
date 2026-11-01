package com.medipriority.controller;

import com.medipriority.dto.request.TriageRequest;
import com.medipriority.dto.response.QueueEntryResponse;
import com.medipriority.dto.response.TriageResponse;
import com.medipriority.service.TriageService;
import com.medipriority.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/triage")
@RequiredArgsConstructor
public class TriageController {

    private final TriageService triageService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MEDICAL_OFFICER', 'ADMIN')")
    public ResponseEntity<TriageResponse> assess(@Valid @RequestBody TriageRequest req) {
        TriageResponse response = triageService.assess(req, SecurityUtil.getCurrentUserId());
        return ResponseEntity.created(URI.create("/api/triage/" + response.triageId()))
                .body(response);
    }

    @GetMapping("/{requestId}/history")
    public ResponseEntity<List<TriageResponse>> getHistory(@PathVariable Long requestId) {
        return ResponseEntity.ok(triageService.getHistory(requestId));
    }

    @GetMapping("/queue")
    public ResponseEntity<List<QueueEntryResponse>> getPriorityQueue() {
        return ResponseEntity.ok(triageService.getPriorityQueue());
    }
}
