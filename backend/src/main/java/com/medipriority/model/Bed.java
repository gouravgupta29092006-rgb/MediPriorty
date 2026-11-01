package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Hospital bed inventory entity.
 * Each bed belongs to a department.
 */
@Entity
@Table(name = "beds",
        uniqueConstraints = {
                @UniqueConstraint(name = "bed_dept_number_uk",
                        columnNames = {"department_id", "bed_number"})
        },
        indexes = {
                @Index(name = "bed_status_idx", columnList = "status"),
                @Index(name = "bed_type_idx", columnList = "bed_type"),
                @Index(name = "bed_dept_idx", columnList = "department_id")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bed_id")
    private Long bedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private HospitalDepartment department;

    @Column(name = "bed_number", nullable = false, length = 20)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_type", nullable = false, length = 15)
    private BedType bedType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private BedStatus status = BedStatus.AVAILABLE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BedType {
        GENERAL, EMERGENCY, ICU
    }

    public enum BedStatus {
        AVAILABLE, RESERVED, OCCUPIED, CLEANING, MAINTENANCE
    }
}
