package com.medipriority.service;

import com.medipriority.dto.response.DashboardResponse;
import com.medipriority.dto.response.DepartmentBedStats;
import com.medipriority.model.Ambulance;
import com.medipriority.model.Bed;
import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.TriageRecord;
import com.medipriority.repository.AmbulanceRepository;
import com.medipriority.repository.BedRepository;
import com.medipriority.repository.EmergencyRequestRepository;
import com.medipriority.repository.TriageRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Async Dashboard Service Multithreading Tests")
class AsyncDashboardServiceTest {

    @Mock
    private EmergencyRequestRepository requestRepository;

    @Mock
    private AmbulanceRepository ambulanceRepository;

    @Mock
    private BedRepository bedRepository;

    @Mock
    private TriageRecordRepository triageRecordRepository;

    private ThreadPoolTaskExecutor analyticsExecutor;
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        analyticsExecutor = new ThreadPoolTaskExecutor();
        analyticsExecutor.setCorePoolSize(2);
        analyticsExecutor.setMaxPoolSize(4);
        analyticsExecutor.setQueueCapacity(50);
        analyticsExecutor.setThreadNamePrefix("test-analytics-");
        analyticsExecutor.initialize();

        dashboardService = new DashboardService(
                requestRepository,
                ambulanceRepository,
                bedRepository,
                triageRecordRepository,
                analyticsExecutor
        );
    }

    @Test
    @DisplayName("Dashboard aggregates independent metrics concurrently across thread pool")
    void testConcurrentDashboardAggregation() {
        // Arrange
        when(requestRepository.countActiveRequests()).thenReturn(4L);
        when(requestRepository.countByRequestStatus(EmergencyRequest.RequestStatus.PENDING_TRIAGE)).thenReturn(1L);

        List<Object[]> triageCounts = new java.util.ArrayList<>();
        triageCounts.add(new Object[]{TriageRecord.TriageCategory.RED, 2L});
        triageCounts.add(new Object[]{TriageRecord.TriageCategory.YELLOW, 1L});
        when(triageRecordRepository.countActiveByTriageCategoryGrouped()).thenReturn(triageCounts);

        when(ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.AVAILABLE)).thenReturn(5L);
        when(ambulanceRepository.countByCurrentStatus(Ambulance.AmbulanceStatus.DISPATCHED)).thenReturn(1L);

        when(bedRepository.countByStatus(Bed.BedStatus.AVAILABLE)).thenReturn(12L);
        when(bedRepository.countByStatus(Bed.BedStatus.OCCUPIED)).thenReturn(8L);
        when(bedRepository.count()).thenReturn(20L);

        List<Object[]> deptBeds = new java.util.ArrayList<>();
        deptBeds.add(new Object[]{"ICU", 4L, 2L, 6L});
        when(bedRepository.countBedsByDepartment()).thenReturn(deptBeds);

        // Act
        DashboardResponse response = dashboardService.getDashboard();

        // Assert
        assertNotNull(response);
        assertEquals(4L, response.totalActiveRequests());
        assertEquals(2L, response.criticalPatients());
        assertEquals(1L, response.waitingPatients());
        assertEquals(5L, response.availableAmbulances());
        assertEquals(12L, response.availableBeds());
        assertEquals(8L, response.occupiedBeds());
        assertEquals(20L, response.totalBeds());
        assertEquals(1, response.departmentBeds().size());

        analyticsExecutor.shutdown();
    }

    @Test
    @DisplayName("Dashboard gracefully handles partial task failures without throwing 500")
    void testConcurrentDashboardHandlesFailureGracefully() {
        // Arrange
        when(requestRepository.countActiveRequests()).thenThrow(new RuntimeException("DB Connection timeout"));
        when(ambulanceRepository.countByCurrentStatus(any())).thenReturn(2L);
        when(bedRepository.countByStatus(any())).thenReturn(5L);
        when(bedRepository.count()).thenReturn(10L);

        // Act
        DashboardResponse response = dashboardService.getDashboard();

        // Assert: gracefully returns fallback metrics rather than aborting
        assertNotNull(response);
        assertEquals(0L, response.totalActiveRequests());
        assertEquals(0L, response.criticalPatients());

        analyticsExecutor.shutdown();
    }
}
