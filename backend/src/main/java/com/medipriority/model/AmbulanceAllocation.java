package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Ambulance allocation history record.
 * Tracks every ambulance dispatch event.
 * Records are never deleted; status changes to COMPLETED or CANCELLED.
 */
@Entity
@Table(name = "ambulance_allocations", indexes = {
        @Index(name = "amb_alloc_request_idx", columnList = "request_id"),
        @Index(name = "amb_alloc_amb_idx", columnList = "ambulance_id"),
        @Index(name = "amb_alloc_status_idx", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmbulanceAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    private Long allocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private EmergencyRequest emergencyRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ambulance_id", nullable = false)
    private Ambulance ambulance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_by", nullable = false)
    private User allocatedBy;

    @Column(name = "dispatch_time")
    private LocalDateTime dispatchTime;

    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private AllocationStatus status = AllocationStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AllocationStatus {
        ACTIVE, COMPLETED, CANCELLED
    }
}
