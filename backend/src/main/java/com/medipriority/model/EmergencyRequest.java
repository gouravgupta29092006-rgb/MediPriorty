package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Emergency request entity.
 * One request per emergency episode for a patient.
 * A patient may have multiple requests over time.
 */
@Entity
@Table(name = "emergency_requests", indexes = {
        @Index(name = "req_patient_idx", columnList = "patient_id"),
        @Index(name = "req_status_idx", columnList = "request_status"),
        @Index(name = "req_created_idx", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "request_number", nullable = false, unique = true, length = 50)
    private String requestNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_status", nullable = false, length = 30)
    @Builder.Default
    private RequestStatus requestStatus = RequestStatus.PENDING_TRIAGE;

    @Column(name = "pickup_location", nullable = false, length = 500)
    private String pickupLocation;

    @Column(name = "pickup_latitude", precision = 10, scale = 8)
    private BigDecimal pickupLatitude;

    @Column(name = "pickup_longitude", precision = 11, scale = 8)
    private BigDecimal pickupLongitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_bed_type", length = 15)
    private BedType requiredBedType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum RequestStatus {
        PENDING_TRIAGE,
        TRIAGED,
        AMBULANCE_DISPATCHED,
        ARRIVED,
        BED_RESERVED,
        ADMITTED,
        CLOSED,
        CANCELLED
    }

    public enum BedType {
        GENERAL, EMERGENCY, ICU
    }
}
