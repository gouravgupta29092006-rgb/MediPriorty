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

        long criticalPatients = triageRecordRepository
                .countByTriageCategory(TriageRecord.TriageCategory.RED);

        long pendingTriage = requestRepository
                .countByRequestStatus(EmergencyRequest.RequestStatus.PENDING_TRIAGE);

        long availableAmb = ambulanceRepository
                .countByCurrentStatus(Ambulance.AmbulanceStatus.AVAILABLE);
        long dispatchedAmb = ambulanceRepository
                .countByCurrentStatus(Ambulance.AmbulanceStatus.DISPATCHED);

        long availableBeds = bedRepository.countByStatus(Bed.BedStatus.AVAILABLE);
        long occupiedBeds = bedRepository.countByStatus(Bed.BedStatus.OCCUPIED);
        long totalBeds = bedRepository.count();

        // Triage distribution
        Map<String, Long> triageDist = new HashMap<>();
        for (TriageRecord.TriageCategory cat : TriageRecord.TriageCategory.values()) {
            triageDist.put(cat.name(), triageRecordRepository.countByTriageCategory(cat));
        }

        // Bed type availability
        Map<String, Long> bedTypeAvail = new HashMap<>();
        for (Bed.BedType type : Bed.BedType.values()) {
            long avail = bedRepository.findAvailableByType(Bed.BedStatus.AVAILABLE, type).size();
            bedTypeAvail.put(type.name(), avail);
        }

        return new DashboardResponse(
                activeRequests, criticalPatients, pendingTriage,
                availableAmb, dispatchedAmb,
                availableBeds, occupiedBeds, totalBeds,
                triageDist, bedTypeAvail);
    }
}
