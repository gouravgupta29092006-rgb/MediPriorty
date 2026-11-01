-- V4: Create emergency_requests table
CREATE TABLE emergency_requests (
    request_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id       BIGINT NOT NULL,
    request_number   VARCHAR(50) NOT NULL UNIQUE,
    request_status   ENUM('PENDING_TRIAGE','TRIAGED','AMBULANCE_DISPATCHED','ARRIVED',
                          'BED_RESERVED','ADMITTED','CLOSED','CANCELLED')
                     NOT NULL DEFAULT 'PENDING_TRIAGE',
    pickup_location  VARCHAR(500) NOT NULL,
    pickup_latitude  DECIMAL(10,8),
    pickup_longitude DECIMAL(11,8),
    required_bed_type ENUM('GENERAL','EMERGENCY','ICU'),
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at        DATETIME,
    CONSTRAINT fk_req_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
