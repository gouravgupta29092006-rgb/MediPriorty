package com.medipriority.dsa;

import com.medipriority.dsa.graph.DijkstraAlgorithm;
import com.medipriority.dsa.graph.HospitalGraph;
import com.medipriority.dsa.graph.ShortestPathResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("DijkstraAlgorithm & HospitalGraph — Road Network DSA Tests")
class DijkstraAlgorithmTest {

    private HospitalGraph graph;
    private DijkstraAlgorithm dijkstra;

    @BeforeEach
    void setUp() {
        graph = new HospitalGraph();
        dijkstra = new DijkstraAlgorithm();

        // 1: Hospital, 2: Station North, 3: Station South, 4: Downtown, 5: West Crossing
        graph.addVertex(1L);
        graph.addVertex(2L);
        graph.addVertex(3L);
        graph.addVertex(4L);
        graph.addVertex(5L);

        // Edges
        graph.addEdge(1L, 2L, 8.0);
        graph.addEdge(2L, 1L, 8.0);

        graph.addEdge(1L, 3L, 4.0);
        graph.addEdge(3L, 1L, 4.0);

        graph.addEdge(3L, 4L, 2.0);
        graph.addEdge(4L, 3L, 2.0);

        graph.addEdge(4L, 2L, 1.0);
        graph.addEdge(2L, 4L, 1.0);
    }

    @Test
    @DisplayName("Should find correct shortest path and weight: 1 -> 3 -> 4 -> 2 (cost 7.0 vs direct 8.0)")
    void testShortestPath() {
        ShortestPathResult result = dijkstra.findShortestPath(graph, 1L, 2L);

        assertTrue(result.isReachable());
        assertEquals(7.0, result.getTotalWeight(), 0.001);
        assertEquals(List.of(1L, 3L, 4L, 2L), result.getPath());
    }

    @Test
    @DisplayName("Should return 0 cost and single-node path when source equals destination")
    void testSameSourceAndDestination() {
        ShortestPathResult result = dijkstra.findShortestPath(graph, 1L, 1L);

        assertTrue(result.isReachable());
        assertEquals(0.0, result.getTotalWeight(), 0.001);
        assertEquals(List.of(1L), result.getPath());
    }

    @Test
    @DisplayName("Should report unreachable when target is disconnected")
    void testUnreachableNode() {
        // Node 5 is added as vertex but has no edges connected to it
        ShortestPathResult result = dijkstra.findShortestPath(graph, 1L, 5L);

        assertFalse(result.isReachable());
        assertTrue(result.getPath().isEmpty());
    }

    @Test
    @DisplayName("Should throw exception for unknown vertices")
    void testUnknownVertex() {
        assertThrows(IllegalArgumentException.class, () ->
                dijkstra.findShortestPath(graph, 1L, 999L));
    }
}
