package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Road network node (vertex) for the hospital graph.
 * Represents geographic points: hospital entrance, ambulance stations,
 * road intersections, and patient pickup zones.
 */
@Entity
@Table(name = "road_nodes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "node_id")
    private Long nodeId;

    @Column(name = "node_name", nullable = false, length = 200)
    private String nodeName;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "node_type", nullable = false, length = 25)
    private NodeType nodeType;

    public enum NodeType {
        HOSPITAL, INTERSECTION, AMBULANCE_STATION, PICKUP_ZONE
    }
}
