package com.medipriority.repository;

import com.medipriority.model.BedAllocation;
import com.medipriority.model.BedAllocation.AllocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BedAllocationRepository extends JpaRepository<BedAllocation, Long> {

    Optional<BedAllocation> findByEmergencyRequest_RequestIdAndStatus(
            Long requestId, AllocationStatus status);

    boolean existsByBed_BedIdAndStatus(Long bedId, AllocationStatus status);

    boolean existsByEmergencyRequest_RequestIdAndStatus(Long requestId, AllocationStatus status);

    @Query("SELECT ba FROM BedAllocation ba WHERE " +
           "(:requestId IS NULL OR ba.emergencyRequest.requestId = :requestId) " +
           "ORDER BY ba.createdAt DESC")
    Page<BedAllocation> findFiltered(@Param("requestId") Long requestId, Pageable pageable);
}
