-- V2: Create hospital and departments tables
CREATE TABLE hospital (
    hospital_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(200) NOT NULL,
    address       TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hospital_departments (
    department_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id     BIGINT NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    description     TEXT,
    active          TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_dept_hospital FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
