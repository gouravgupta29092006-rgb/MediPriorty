package com.medipriority.controller;

import com.medipriority.dto.request.AutoAssignBedRequest;
import com.medipriority.dto.request.AutoDispatchAmbulanceRequest;
import com.medipriority.dto.request.ManualAssignBedRequest;
import com.medipriority.dto.request.ManualDispatchAmbulanceRequest;
import com.medipriority.dto.response.AmbulanceAllocationResponse;
import com.medipriority.dto.response.BedAllocationResponse;
import com.medipriority.service.AmbulanceAllocationService;
import com.medipriority.service.BedAllocationService;
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

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
public class AllocationController {

    private final AmbulanceAllocationService ambulanceAllocationService;
    private final BedAllocationService bedAllocationService;

    // --- Ambulance Allocations (DISPATCHER role only) ---

    @PostMapping("/ambulance/auto")
    @PreAuthorize("hasRole('DISPATCHER')")
    public ResponseEntity<AmbulanceAllocationResponse> autoDispatch(
            @Valid @RequestBody AutoDispatchAmbulanceRequest req) {
        return ResponseEntity.ok(ambulanceAllocationService.autoDispatch(
                req.requestId(), SecurityUtil.getCurrentUserId()));
    }

    @PostMapping("/ambulance/manual")
    @PreAuthorize("hasRole('DISPATCHER')")
    public ResponseEntity<AmbulanceAllocationResponse> manualDispatch(
            @Valid @RequestBody ManualDispatchAmbulanceRequest req) {
        return ResponseEntity.ok(ambulanceAllocationService.manualDispatch(
                req.requestId(), req.ambulanceId(), SecurityUtil.getCurrentUserId()));
    }

    @PatchMapping("/ambulance/{id}/arrived")
    @PreAuthorize("hasRole('DISPATCHER')")
    public ResponseEntity<AmbulanceAllocationResponse> markAmbulanceArrived(@PathVariable Long id) {
        return ResponseEntity.ok(ambulanceAllocationService.markArrived(id, SecurityUtil.getCurrentUserId()));
    }

    @PatchMapping("/ambulance/{id}/complete")
    @PreAuthorize("hasRole('DISPATCHER')")
    public ResponseEntity<AmbulanceAllocationResponse> completeAmbulanceAllocation(@PathVariable Long id) {
        return ResponseEntity.ok(ambulanceAllocationService.complete(id, SecurityUtil.getCurrentUserId()));
    }

    @GetMapping("/ambulance")
    public ResponseEntity<Page<AmbulanceAllocationResponse>> listAmbulanceAllocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dispatchTime").descending());
        return ResponseEntity.ok(ambulanceAllocationService.findAll(pageable));
    }

    // --- Bed Allocations ---

    @PostMapping("/bed/auto")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<BedAllocationResponse> autoAssignBed(
            @Valid @RequestBody AutoAssignBedRequest req) {
        return ResponseEntity.ok(bedAllocationService.autoAssign(
                req.requestId(), SecurityUtil.getCurrentUserId()));
    }

    @PostMapping("/bed/manual")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<BedAllocationResponse> manualAssignBed(
            @Valid @RequestBody ManualAssignBedRequest req) {
        return ResponseEntity.ok(bedAllocationService.manualAssign(
                req.requestId(), req.bedId(), SecurityUtil.getCurrentUserId()));
    }

    @PatchMapping("/bed/{id}/admit")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<BedAllocationResponse> admitPatient(@PathVariable Long id) {
        return ResponseEntity.ok(bedAllocationService.admit(id, SecurityUtil.getCurrentUserId()));
    }

    @PatchMapping("/bed/{id}/release")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<BedAllocationResponse> releaseBed(@PathVariable Long id) {
        return ResponseEntity.ok(bedAllocationService.release(id, SecurityUtil.getCurrentUserId()));
    }

    @GetMapping("/bed")
    public ResponseEntity<Page<BedAllocationResponse>> listBedAllocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservedAt").descending());
        return ResponseEntity.ok(bedAllocationService.findAll(pageable));
    }
}
