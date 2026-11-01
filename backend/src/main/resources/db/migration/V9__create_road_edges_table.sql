-- V9: Create road_edges table
CREATE TABLE road_edges (
    edge_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_node_id       BIGINT NOT NULL,
    destination_node_id  BIGINT NOT NULL,
    travel_time_minutes  DECIMAL(6,2) NOT NULL,
    distance_km          DECIMAL(6,3) NOT NULL,
    bidirectional        TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_edge_source FOREIGN KEY (source_node_id) REFERENCES road_nodes(node_id),
    CONSTRAINT fk_edge_dest   FOREIGN KEY (destination_node_id) REFERENCES road_nodes(node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
