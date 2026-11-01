package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Road network edge (connection between two nodes).
 * Weighted by travel_time_minutes. May be bidirectional.
 */
@Entity
@Table(name = "road_edges", indexes = {
        @Index(name = "edge_source_idx", columnList = "source_node_id"),
        @Index(name = "edge_dest_idx", columnList = "destination_node_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "edge_id")
    private Long edgeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_node_id", nullable = false)
    private RoadNode sourceNode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_node_id", nullable = false)
    private RoadNode destinationNode;

    @Column(name = "travel_time_minutes", nullable = false, precision = 6, scale = 2)
    private BigDecimal travelTimeMinutes;

    @Column(name = "distance_km", nullable = false, precision = 6, scale = 3)
    private BigDecimal distanceKm;

    @Column(name = "bidirectional", nullable = false)
    @Builder.Default
    private boolean bidirectional = true;
}
