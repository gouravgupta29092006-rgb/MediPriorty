package com.medipriority.service;

import com.medipriority.dto.response.DashboardResponse;
import com.medipriority.dto.response.DepartmentBedStats;
import com.medipriority.model.Ambulance;
import com.medipriority.model.Bed;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.TriageRecord;
import com.medipriority.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Dashboard analytics service.
 * Employs Java Multithreading with bounded ThreadPoolTaskExecutor (analyticsExecutor)
 * to aggregate emergency requests, ambulance fleet, and bed occupancy metrics concurrently.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final EmergencyRequestRepository requestRepository;
    private final AmbulanceRepository ambulanceRepository;
    private final BedRepository bedRepository;
    private final TriageRecordRepository triageRecordRepository;

    @Qualifier("analyticsExecutor")
    private final ThreadPoolTaskExecutor analyticsExecutor;

    // Internal immutable records holding concurrent aggregation slices
    private record EmergencyMetrics(
            long activeRequests,
            long criticalPatients,
            long pendingTriage,
            Map<String, Long> triageDist
    ) {}

    private record FleetMetrics(
            long availableAmb,
            long dispatchedAmb,
            long onSceneAmb,
            long returningAmb,
            long reservedAmb,
            long maintenanceAmb
    ) {}

    private record BedMetrics(
            long availableBeds,
            long occupiedBeds,
            long totalBeds,
            Map<String, Long> bedTypeAvail,
            Map<String, Long> bedTypeOccupied,
            List<DepartmentBedStats> departmentBeds
    ) {}

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long start = System.currentTimeMillis();

        // 1. Asynchronously retrieve Emergency & Triage metrics
        CompletableFuture<EmergencyMetrics> emergencyFuture = CompletableFuture.supplyAsync(() -> {
            log.debug("Fetching emergency metrics on thread: {}", Thread.currentThread().getName());
            long active = requestRepository.countActiveRequests();
            long pending = requestRepository.countByRequestStatus(EmergencyRequest.RequestStatus.PENDING_TRIAGE);

            Map<String, Long> dist = new HashMap<>();
            for (TriageRecord.TriageCategory cat : TriageRecord.TriageCategory.values()) {
                dist.put(cat.name(), 0L);
            }
            triageRecordRepository.countActiveByTriageCategoryGrouped()
                    .forEach(row -> dist.put(
                            ((TriageRecord.TriageCategory) row[0]).name(),
                            (Long) row[1]));

            long critical = dist.getOrDefault("RED", 0L);
            return new EmergencyMetrics(active, critical, pending, dist);
        }, analyticsExecutor).exceptionally(ex -> {
            log.error("Error computing emergency metrics concurrently: {}", ex.getMessage());
            return new EmergencyMetrics(0, 0, 0, Map.of());
        });

        // 2. Asynchronously retrieve Ambulance Fleet metrics
        CompletableFuture<FleetMetrics> fleetFuture = CompletableFuture.supplyAsync(() -> {
            log.debug("Fetching fleet metrics on thread: {}", Thread.currentThread().getName());
            long avail = ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.AVAILABLE);
            long dispatched = ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.DISPATCHED);
            long onScene = ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.ON_SCENE);
            long returning = ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.RETURNING);
            long reserved = ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.RESERVED);
            long maint = ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.MAINTENANCE);
            return new FleetMetrics(avail, dispatched, onScene, returning, reserved, maint);
        }, analyticsExecutor).exceptionally(ex -> {
            log.error("Error computing fleet metrics concurrently: {}", ex.getMessage());
            return new FleetMetrics(0, 0, 0, 0, 0, 0);
        });

        // 3. Asynchronously retrieve Bed metrics
        CompletableFuture<BedMetrics> bedFuture = CompletableFuture.supplyAsync(() -> {
            log.debug("Fetching bed metrics on thread: {}", Thread.currentThread().getName());
            long avail = bedRepository.countByStatus(Bed.BedStatus.AVAILABLE);
            long occupied = bedRepository.countByStatus(Bed.BedStatus.OCCUPIED);
            long total = bedRepository.count();

            Map<String, Long> bedTypeAvail = new HashMap<>();
            for (Bed.BedType type : Bed.BedType.values()) {
                long count = bedRepository.findAvailableByType(Bed.BedStatus.AVAILABLE, type).size();
                bedTypeAvail.put(type.name(), count);
            }

            Map<String, Long> bedTypeOccupied = new HashMap<>();
            for (Bed.BedType type : Bed.BedType.values()) {
                long count = bedRepository.countByStatusAndBedType(Bed.BedStatus.OCCUPIED, type);
                bedTypeOccupied.put(type.name(), count);
            }

            List<DepartmentBedStats> deptBeds = bedRepository.countBedsByDepartment().stream()
                    .map(row -> new DepartmentBedStats(
                            (String) row[0],
                            row[1] != null ? ((Number) row[1]).longValue() : 0L,
                            row[2] != null ? ((Number) row[2]).longValue() : 0L,
                            row[3] != null ? ((Number) row[3]).longValue() : 0L
                    ))
                    .toList();

            return new BedMetrics(avail, occupied, total, bedTypeAvail, bedTypeOccupied, deptBeds);
        }, analyticsExecutor).exceptionally(ex -> {
            log.error("Error computing bed metrics concurrently: {}", ex.getMessage());
            return new BedMetrics(0, 0, 0, Map.of(), Map.of(), List.of());
        });

        // Wait for all 3 subtasks to complete within a bounded timeout of 4 seconds
        try {
            CompletableFuture.allOf(emergencyFuture, fleetFuture, bedFuture)
                    .get(4, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Concurrent dashboard aggregation timed out or was interrupted: {}. Using completed results.",
                    e.getMessage());
        }

        EmergencyMetrics em = emergencyFuture.getNow(new EmergencyMetrics(0, 0, 0, Map.of()));
        FleetMetrics fm = fleetFuture.getNow(new FleetMetrics(0, 0, 0, 0, 0, 0));
        BedMetrics bm = bedFuture.getNow(new BedMetrics(0, 0, 0, Map.of(), Map.of(), List.of()));

        log.debug("Concurrent dashboard metrics aggregated in {} ms", System.currentTimeMillis() - start);

        return new DashboardResponse(
                em.activeRequests(), em.criticalPatients(), em.pendingTriage(),
                fm.availableAmb(), fm.dispatchedAmb(), fm.onSceneAmb(),
                fm.returningAmb(), fm.reservedAmb(), fm.maintenanceAmb(),
                bm.availableBeds(), bm.occupiedBeds(), bm.totalBeds(),
                em.triageDist(), bm.bedTypeAvail(), bm.bedTypeOccupied(), bm.departmentBeds());
    }
}
