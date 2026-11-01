-- V8: Create allocation tables
CREATE TABLE ambulance_allocations (
    allocation_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id      BIGINT NOT NULL,
    ambulance_id    BIGINT NOT NULL,
    allocated_by    BIGINT NOT NULL,
    dispatch_time   DATETIME,
    arrival_time    DATETIME,
    completion_time DATETIME,
    status          ENUM('ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aa_request   FOREIGN KEY (request_id)   REFERENCES emergency_requests(request_id),
    CONSTRAINT fk_aa_ambulance FOREIGN KEY (ambulance_id) REFERENCES ambulances(ambulance_id),
    CONSTRAINT fk_aa_user      FOREIGN KEY (allocated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bed_allocations (
    allocation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id    BIGINT NOT NULL,
    bed_id        BIGINT NOT NULL,
    allocated_by  BIGINT NOT NULL,
    reserved_at   DATETIME,
    admitted_at   DATETIME,
    released_at   DATETIME,
    status        ENUM('ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ba_request FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id),
    CONSTRAINT fk_ba_bed     FOREIGN KEY (bed_id)     REFERENCES beds(bed_id),
    CONSTRAINT fk_ba_user    FOREIGN KEY (allocated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
