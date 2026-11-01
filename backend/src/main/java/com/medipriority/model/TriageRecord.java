package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Triage record — clinical assessment of a patient's urgency.
 *
 * <p>IMMUTABLE: Records are never updated or deleted.
 * Each reassessment creates a new record with assessment_version incremented.
 * The latest record (max assessment_version per request_id) is the current triage.
 */
@Entity
@Table(name = "triage_records", indexes = {
        @Index(name = "triage_request_idx", columnList = "request_id"),
        @Index(name = "triage_category_idx", columnList = "triage_category"),
        @Index(name = "triage_assessed_idx", columnList = "assessed_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "triage_id")
    private Long triageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private EmergencyRequest emergencyRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_officer_id", nullable = false)
    private User medicalOfficer;

    @Enumerated(EnumType.STRING)
    @Column(name = "triage_category", nullable = false, length = 10)
    private TriageCategory triageCategory;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "vital_signs_json", columnDefinition = "json")
    private String vitalSignsJson;

    @Column(name = "assessment_version", nullable = false)
    @Builder.Default
    private Integer assessmentVersion = 1;

    @Column(name = "assessed_at", nullable = false, updatable = false)
    private LocalDateTime assessedAt;

    @PrePersist
    protected void onCreate() {
        assessedAt = LocalDateTime.now();
    }

    /**
     * Clinical triage categories.
     * Priority value used by the custom binary min-heap:
     * RED=1 (highest priority), ORANGE=2, YELLOW=3, GREEN=4 (lowest).
     */
    public enum TriageCategory {
        RED(1),
        ORANGE(2),
        YELLOW(3),
        GREEN(4);

        private final int priorityValue;

        TriageCategory(int priorityValue) {
            this.priorityValue = priorityValue;
        }

        public int getPriorityValue() {
            return priorityValue;
        }
    }
}
