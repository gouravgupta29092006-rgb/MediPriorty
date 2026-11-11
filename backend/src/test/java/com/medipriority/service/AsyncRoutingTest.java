package com.medipriority.service;

import com.medipriority.dsa.graph.HospitalGraph;
import com.medipriority.repository.RoadEdgeRepository;
import com.medipriority.repository.RoadNodeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Async Road Network Multithreaded Routing Tests")
class AsyncRoutingTest {

    @Mock
    private RoadNodeRepository nodeRepository;

    @Mock
    private RoadEdgeRepository edgeRepository;

    private RoadNetworkService roadNetworkService;
    private ThreadPoolTaskExecutor routingExecutor;

    @BeforeEach
    void setUp() throws Exception {
        roadNetworkService = new RoadNetworkService(nodeRepository, edgeRepository);

        // Build a test hospital graph directly
        HospitalGraph graph = new HospitalGraph();
        graph.addVertex(1L); // Hospital
        graph.addVertex(2L); // North Station
        graph.addVertex(3L); // South Station
        graph.addVertex(4L); // Pickup Point

        graph.addEdge(1L, 2L, 8.5);
        graph.addEdge(2L, 1L, 8.5);

        graph.addEdge(1L, 3L, 7.0);
        graph.addEdge(3L, 1L, 7.0);

        graph.addEdge(2L, 4L, 9.0);
        graph.addEdge(4L, 2L, 9.0);

        graph.addEdge(3L, 4L, 8.0);
        graph.addEdge(4L, 3L, 8.0);

        Field graphField = RoadNetworkService.class.getDeclaredField("graph");
        graphField.setAccessible(true);
        graphField.set(roadNetworkService, graph);

        routingExecutor = new ThreadPoolTaskExecutor();
        routingExecutor.setCorePoolSize(3);
        routingExecutor.setMaxPoolSize(6);
        routingExecutor.setQueueCapacity(50);
        routingExecutor.setThreadNamePrefix("test-routing-");
        routingExecutor.initialize();
    }

    @AfterEach
    void tearDown() {
        routingExecutor.shutdown();
    }

    @Test
    @DisplayName("Asynchronously estimates single travel time via CompletableFuture")
    void testEstimateTravelTimeAsync() throws Exception {
        CompletableFuture<Double> future = roadNetworkService.estimateTravelTimeAsync(2L, 1L, routingExecutor);
        Double minutes = future.get();
        assertEquals(8.5, minutes, 0.01);
    }

    @Test
    @DisplayName("Concurrently estimates multiple routes without thread collision or graph mutation")
    void testEstimateMultipleRoutesConcurrently() {
        List<long[]> routes = List.of(
                new long[]{2L, 1L},
                new long[]{3L, 1L},
                new long[]{2L, 4L},
                new long[]{3L, 4L}
        );

        Map<String, Double> results = roadNetworkService.estimateMultipleRoutesConcurrently(routes, routingExecutor);

        assertEquals(4, results.size());
        assertEquals(8.5, results.get("2->1"), 0.01);
        assertEquals(7.0, results.get("3->1"), 0.01);
        assertEquals(9.0, results.get("2->4"), 0.01);
        assertEquals(8.0, results.get("3->4"), 0.01);
    }
}

