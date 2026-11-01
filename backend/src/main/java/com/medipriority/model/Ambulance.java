package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Ambulance inventory entity.
 * Tracks each ambulance, its capabilities, current status, and position.
 */
@Entity
@Table(name = "ambulances", indexes = {
        @Index(name = "amb_status_idx", columnList = "current_status"),
        @Index(name = "amb_type_idx", columnList = "ambulance_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ambulance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ambulance_id")
    private Long ambulanceId;

    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "ambulance_type", nullable = false, length = 20)
    private AmbulanceType ambulanceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_level", nullable = false, length = 15)
    private EquipmentLevel equipmentLevel;

    @Column(name = "available_medical_personnel", nullable = false)
    @Builder.Default
    private int availableMedicalPersonnel = 2;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 20)
    @Builder.Default
    private AmbulanceStatus currentStatus = AmbulanceStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_node_id")
    private RoadNode currentNode;

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

    public enum AmbulanceType {
        BASIC, ADVANCED, CRITICAL_CARE
    }

    public enum EquipmentLevel {
        BLS,  // Basic Life Support
        ALS,  // Advanced Life Support
        CRITICAL
    }

    public enum AmbulanceStatus {
        AVAILABLE, RESERVED, DISPATCHED, ON_SCENE, RETURNING, MAINTENANCE
    }
}
