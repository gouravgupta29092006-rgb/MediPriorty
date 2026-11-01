package com.medipriority.service;

import com.medipriority.dsa.graph.DijkstraAlgorithm;
import com.medipriority.dsa.graph.HospitalGraph;
import com.medipriority.dsa.graph.ShortestPathResult;
import com.medipriority.model.RoadEdge;
import com.medipriority.model.RoadNode;
import com.medipriority.repository.RoadEdgeRepository;
import com.medipriority.repository.RoadNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

/**
 * Road network graph service.
 * Loads the graph from MySQL on startup.
 * Provides Dijkstra shortest-path calculations for ambulance dispatch.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoadNetworkService {

    private final RoadNodeRepository nodeRepository;
    private final RoadEdgeRepository edgeRepository;
    private final DijkstraAlgorithm dijkstra = new DijkstraAlgorithm();

    private HospitalGraph graph;

    @PostConstruct
    public void loadGraph() {
        log.info("Loading road network graph from database...");
        graph = new HospitalGraph();

        List<RoadNode> nodes = nodeRepository.findAll();
        for (RoadNode node : nodes) {
            graph.addVertex(node.getNodeId());
        }

        List<RoadEdge> edges = edgeRepository.findAll();
        for (RoadEdge edge : edges) {
            double weight = edge.getTravelTimeMinutes().doubleValue();
            graph.addEdge(edge.getSourceNode().getNodeId(),
                          edge.getDestinationNode().getNodeId(), weight);
            if (edge.isBidirectional()) {
                graph.addEdge(edge.getDestinationNode().getNodeId(),
                              edge.getSourceNode().getNodeId(), weight);
            }
        }

        log.info("Road graph loaded: {} vertices, {} edges",
                graph.getVertexCount(), graph.getEdgeCount());
    }

    /**
     * Estimate travel time in minutes from sourceNode to destNode.
     * Returns -1 if the route is unreachable or graph is not configured.
     */
    public double estimateTravelTime(Long sourceNodeId, Long destNodeId) {
        if (graph == null || sourceNodeId == null || destNodeId == null) {
            return -1;
        }
        if (!graph.hasVertex(sourceNodeId) || !graph.hasVertex(destNodeId)) {
            return -1;
        }
        try {
            ShortestPathResult result = dijkstra.findShortestPath(graph, sourceNodeId, destNodeId);
            return result.isReachable() ? result.getTotalWeight() : -1;
        } catch (Exception e) {
            log.warn("Dijkstra failed for {} -> {}: {}", sourceNodeId, destNodeId, e.getMessage());
            return -1;
        }
    }

    public HospitalGraph getGraph() {
        return graph;
    }
}
