package com.medipriority.repository;

import com.medipriority.model.Ambulance;
import com.medipriority.model.Ambulance.AmbulanceStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {

    List<Ambulance> findByCurrentStatus(AmbulanceStatus status);

    long countByCurrentStatus(AmbulanceStatus status);

    /**
     * Pessimistic lock for allocation — prevents concurrent double-allocation.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Ambulance a WHERE a.ambulanceId = :id")
    Optional<Ambulance> findByIdWithLock(@Param("id") Long id);
}
