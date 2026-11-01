package com.medipriority.controller;

import com.medipriority.dsa.graph.HospitalGraph;
import com.medipriority.service.RoadNetworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/routing")
@RequiredArgsConstructor
public class RoadNetworkController {

    private final RoadNetworkService roadNetworkService;

    @GetMapping("/travel-time")
    public ResponseEntity<Map<String, Object>> getTravelTime(
            @RequestParam Long sourceNodeId,
            @RequestParam Long destNodeId) {
        double minutes = roadNetworkService.estimateTravelTime(sourceNodeId, destNodeId);
        return ResponseEntity.ok(Map.of(
                "sourceNodeId", sourceNodeId,
                "destNodeId", destNodeId,
                "travelTimeMinutes", minutes,
                "reachable", minutes >= 0
        ));
    }

    @GetMapping("/graph-summary")
    public ResponseEntity<Map<String, Object>> getGraphSummary() {
        HospitalGraph g = roadNetworkService.getGraph();
        if (g == null) {
            return ResponseEntity.ok(Map.of("status", "NOT_INITIALIZED", "vertices", 0, "edges", 0));
        }
        return ResponseEntity.ok(Map.of(
                "status", "ACTIVE",
                "vertices", g.getVertexCount(),
                "edges", g.getEdgeCount()
        ));
    }
}
