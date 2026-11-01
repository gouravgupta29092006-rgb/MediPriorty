-- V5: Create triage_records table
-- IMMUTABLE: rows are never updated or deleted.
-- Each reassessment creates a new row with assessment_version incremented.
CREATE TABLE triage_records (
    triage_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id         BIGINT NOT NULL,
    medical_officer_id BIGINT NOT NULL,
    triage_category    ENUM('RED','ORANGE','YELLOW','GREEN') NOT NULL,
    clinical_notes     TEXT,
    vital_signs_json   JSON,
    assessment_version INT NOT NULL DEFAULT 1,
    assessed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_triage_request FOREIGN KEY (request_id) REFERENCES emergency_requests(request_id),
    CONSTRAINT fk_triage_officer FOREIGN KEY (medical_officer_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
