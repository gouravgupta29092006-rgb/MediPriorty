-- V3: Create patients table
CREATE TABLE patients (
    patient_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name         VARCHAR(150) NOT NULL,
    date_of_birth     DATE,
    gender            ENUM('MALE','FEMALE','OTHER'),
    contact_number    VARCHAR(20),
    emergency_contact VARCHAR(255),
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
