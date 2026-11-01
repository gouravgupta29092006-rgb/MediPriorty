package com.medipriority.repository;

import com.medipriority.model.AmbulanceAllocation;
import com.medipriority.model.AmbulanceAllocation.AllocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AmbulanceAllocationRepository extends JpaRepository<AmbulanceAllocation, Long> {

    Optional<AmbulanceAllocation> findByEmergencyRequest_RequestIdAndStatus(
            Long requestId, AllocationStatus status);

    boolean existsByAmbulance_AmbulanceIdAndStatus(Long ambulanceId, AllocationStatus status);

    boolean existsByEmergencyRequest_RequestIdAndStatus(Long requestId, AllocationStatus status);

    Page<AmbulanceAllocation> findAll(Pageable pageable);

    @Query("SELECT aa FROM AmbulanceAllocation aa WHERE " +
           "(:requestId IS NULL OR aa.emergencyRequest.requestId = :requestId) " +
           "ORDER BY aa.createdAt DESC")
    Page<AmbulanceAllocation> findFiltered(@Param("requestId") Long requestId, Pageable pageable);
}
