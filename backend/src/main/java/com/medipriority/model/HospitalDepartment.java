package com.medipriority.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Hospital department entity.
 * Each department contains a set of beds.
 */
@Entity
@Table(name = "hospital_departments", indexes = {
        @Index(name = "dept_hospital_idx", columnList = "hospital_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "department_name", nullable = false, length = 150)
    private String departmentName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
