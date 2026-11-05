package com.medipriority.service;

import com.medipriority.dto.response.DashboardResponse;
import com.medipriority.model.Ambulance;
import com.medipriority.model.Bed;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.TriageRecord;
import com.medipriority.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard analytics service.
 * All statistics are read from MySQL — no hardcoded values.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmergencyRequestRepository requestRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final BedRepository bedRepository;
    private final TriageRecordRepository triageRecordRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long activeRequests = requestRepository.countActiveRequests();

        long pendingTriage = requestRepository
                .countByRequestStatus(EmergencyRequest.RequestStatus.PENDING_TRIAGE);

        long availableAmb = ambulanceRepository
                .countByCurrentStatus(Ambulance.AmbulanceStatus.AVAILABLE);
        long dispatchedAmb = ambulanceRepository
                .countByCurrentStatus(Ambulance.AmbulanceStatus.DISPATCHED);
        long onSceneAmb = ambulanceRepository
                .countByCurrentStatus(Ambulance.AmbulanceStatus.ON_SCENE);
        long returningAmb = ambulanceRepository
                .countByCurrentStatus(Ambulance.AmbulanceStatus.RETURNING);
        long reservedAmb = ambulanceRepository
                .countByCurrentStatus(Ambulance.AmbulanceStatus.RESERVED);

        long availableBeds = bedRepository.countByStatus(Bed.BedStatus.AVAILABLE);
        long occupiedBeds = bedRepository.countByStatus(Bed.BedStatus.OCCUPIED);
        long totalBeds = bedRepository.count();

        // Triage distribution — count ONLY the latest assessment version per request
        Map<String, Long> triageDist = new HashMap<>();
        for (TriageRecord.TriageCategory cat : TriageRecord.TriageCategory.values()) {
            triageDist.put(cat.name(), 0L);
        }
        triageRecordRepository.countByTriageCategoryGrouped()
                .forEach(row -> triageDist.put(
                        ((TriageRecord.TriageCategory) row[0]).name(),
                        (Long) row[1]));

        // criticalPatients from the corrected grouped triage distribution (RED category)
        long criticalPatients = triageDist.getOrDefault("RED", 0L);

        // Bed type availability (active departments only)
        Map<String, Long> bedTypeAvail = new HashMap<>();
        for (Bed.BedType type : Bed.BedType.values()) {
            long avail = bedRepository.findAvailableByType(Bed.BedStatus.AVAILABLE, type).size();
            bedTypeAvail.put(type.name(), avail);
        }

        // Bed type occupied count per type
        Map<String, Long> bedTypeOccupied = new HashMap<>();
        for (Bed.BedType type : Bed.BedType.values()) {
            long occupied = bedRepository.countByStatusAndBedType(Bed.BedStatus.OCCUPIED, type);
            bedTypeOccupied.put(type.name(), occupied);
        }

        return new DashboardResponse(
                activeRequests, criticalPatients, pendingTriage,
                availableAmb, dispatchedAmb, onSceneAmb, returningAmb, reservedAmb,
                availableBeds, occupiedBeds, totalBeds,
                triageDist, bedTypeAvail, bedTypeOccupied);
    }
}
