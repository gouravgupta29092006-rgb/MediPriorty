package com.medipriority.service;

import com.medipriority.dto.request.BedRequest;
import com.medipriority.dto.response.BedResponse;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.Bed;
import com.medipriority.model.HospitalDepartment;
import com.medipriority.repository.BedRepository;
import com.medipriority.repository.HospitalDepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BedService {

    private final BedRepository bedRepository;
    private final HospitalDepartmentRepository departmentRepository;
    private final AuditService auditService;

    @Transactional
    public BedResponse create(BedRequest req, Long actingUserId) {
        HospitalDepartment dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("HospitalDepartment", req.departmentId()));

        Bed bed = Bed.builder()
                .department(dept)
                .bedNumber(req.bedNumber())
                .bedType(req.bedType())
                .status(Bed.BedStatus.AVAILABLE)
                .build();

        Bed saved = bedRepository.save(bed);
        auditService.log(actingUserId, "BED_CREATED", "Bed", saved.getBedId(), null);
        return toResponse(saved);
    }

    public Page<BedResponse> findAll(Pageable pageable) {
        return bedRepository.findAll(pageable).map(this::toResponse);
    }

    public List<BedResponse> findAvailableByType(Bed.BedType type) {
        return bedRepository.findAvailableByType(Bed.BedStatus.AVAILABLE, type)
                .stream().map(this::toResponse).toList();
    }

    public BedResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public BedResponse updateStatus(Long id, Bed.BedStatus newStatus, Long actingUserId) {
        Bed bed = getOrThrow(id);
        bed.setStatus(newStatus);
        auditService.log(actingUserId, "BED_STATUS_UPDATED", "Bed", id,
                "{\"status\":\"" + newStatus + "\"}");
        return toResponse(bedRepository.save(bed));
    }

    public Bed getOrThrow(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed", id));
    }

    public BedResponse toResponse(Bed b) {
        return new BedResponse(b.getBedId(), b.getBedNumber(), b.getBedType(), b.getStatus(),
                b.getDepartment().getDepartmentId(), b.getDepartment().getDepartmentName(),
                b.getUpdatedAt());
    }
}
