package com.medipriority.service;

import com.medipriority.dto.request.AmbulanceRequest;
import com.medipriority.dto.response.AmbulanceResponse;
import com.medipriority.exception.ResourceNotFoundException;
import com.medipriority.model.Ambulance;
import com.medipriority.model.RoadNode;
import com.medipriority.repository.AmbulanceRepository;
import com.medipriority.repository.RoadNodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final RoadNodeRepository roadNodeRepository;
    private final AuditService auditService;

    @Transactional
    public AmbulanceResponse create(AmbulanceRequest req, Long actingUserId) {
        RoadNode node = req.currentNodeId() != null
                ? roadNodeRepository.findById(req.currentNodeId())
                        .orElseThrow(() -> new ResourceNotFoundException("RoadNode", req.currentNodeId()))
                : null;

        Ambulance ambulance = Ambulance.builder()
                .registrationNumber(req.registrationNumber())
                .ambulanceType(req.ambulanceType())
                .equipmentLevel(req.equipmentLevel())
                .availableMedicalPersonnel(req.availableMedicalPersonnel())
                .currentStatus(Ambulance.AmbulanceStatus.AVAILABLE)
                .currentNode(node)
                .build();

        Ambulance saved = ambulanceRepository.save(ambulance);
        auditService.log(actingUserId, "AMBULANCE_CREATED", "Ambulance", saved.getAmbulanceId(), null);
        return toResponse(saved);
    }

    public Page<AmbulanceResponse> findAll(Pageable pageable) {
        return ambulanceRepository.findAll(pageable).map(this::toResponse);
    }

    public List<AmbulanceResponse> findAvailable() {
        return ambulanceRepository.findByCurrentStatus(Ambulance.AmbulanceStatus.AVAILABLE)
                .stream().map(this::toResponse).toList();
    }

    public AmbulanceResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public AmbulanceResponse updateStatus(Long id, Ambulance.AmbulanceStatus newStatus,
                                           Long actingUserId) {
        Ambulance ambulance = getOrThrow(id);
        ambulance.setCurrentStatus(newStatus);
        auditService.log(actingUserId, "AMBULANCE_STATUS_UPDATED", "Ambulance", id,
                "{\"status\":\"" + newStatus + "\"}");
        return toResponse(ambulanceRepository.save(ambulance));
    }

    @Transactional
    public AmbulanceResponse update(Long id, AmbulanceRequest req, Long actingUserId) {
        Ambulance ambulance = getOrThrow(id);
        RoadNode node = req.currentNodeId() != null
                ? roadNodeRepository.findById(req.currentNodeId()).orElse(null) : null;
        ambulance.setRegistrationNumber(req.registrationNumber());
        ambulance.setAmbulanceType(req.ambulanceType());
        ambulance.setEquipmentLevel(req.equipmentLevel());
        ambulance.setAvailableMedicalPersonnel(req.availableMedicalPersonnel());
        ambulance.setCurrentNode(node);
        auditService.log(actingUserId, "AMBULANCE_UPDATED", "Ambulance", id, null);
        return toResponse(ambulanceRepository.save(ambulance));
    }

    public Ambulance getOrThrow(Long id) {
        return ambulanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ambulance", id));
    }

    public AmbulanceResponse toResponse(Ambulance a) {
        return new AmbulanceResponse(
                a.getAmbulanceId(), a.getRegistrationNumber(),
                a.getAmbulanceType(), a.getEquipmentLevel(),
                a.getAvailableMedicalPersonnel(), a.getCurrentStatus(),
                a.getCurrentNode() != null ? a.getCurrentNode().getNodeId() : null,
                a.getCurrentNode() != null ? a.getCurrentNode().getNodeName() : null,
                a.getUpdatedAt());
    }
}
