-- V7: Create beds table
CREATE TABLE beds (
    bed_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    bed_number    VARCHAR(20) NOT NULL,
    bed_type      ENUM('GENERAL','EMERGENCY','ICU') NOT NULL,
    status        ENUM('AVAILABLE','RESERVED','OCCUPIED','CLEANING','MAINTENANCE')
                  NOT NULL DEFAULT 'AVAILABLE',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bed_dept FOREIGN KEY (department_id) REFERENCES hospital_departments(department_id),
    CONSTRAINT bed_dept_number_uk UNIQUE (department_id, bed_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
