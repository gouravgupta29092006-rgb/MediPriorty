-- V6: Create road_nodes table (needed before ambulances FK)
CREATE TABLE road_nodes (
    node_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    node_name VARCHAR(200) NOT NULL,
    latitude  DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    node_type ENUM('HOSPITAL','INTERSECTION','AMBULANCE_STATION','PICKUP_ZONE') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- V6b: Create ambulances table
CREATE TABLE ambulances (
    ambulance_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number       VARCHAR(50) NOT NULL UNIQUE,
    ambulance_type            ENUM('BASIC','ADVANCED','CRITICAL_CARE') NOT NULL,
    equipment_level           ENUM('BLS','ALS','CRITICAL') NOT NULL,
    available_medical_personnel INT NOT NULL DEFAULT 2,
    current_status            ENUM('AVAILABLE','RESERVED','DISPATCHED','ON_SCENE','RETURNING','MAINTENANCE')
                              NOT NULL DEFAULT 'AVAILABLE',
    current_node_id           BIGINT,
    created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_amb_node FOREIGN KEY (current_node_id) REFERENCES road_nodes(node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
