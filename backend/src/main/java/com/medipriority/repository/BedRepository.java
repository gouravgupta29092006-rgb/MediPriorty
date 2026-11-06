package com.medipriority.repository;

import com.medipriority.model.Bed;
import com.medipriority.model.Bed.BedStatus;
import com.medipriority.model.Bed.BedType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {

    List<Bed> findByStatusAndBedType(BedStatus status, BedType type);

    List<Bed> findByStatus(BedStatus status);

    long countByStatus(BedStatus status);

    long countByBedType(BedType type);

    @Query("SELECT b FROM Bed b WHERE b.status = :status AND b.bedType = :type " +
           "AND b.department.active = true")
    List<Bed> findAvailableByType(@Param("status") BedStatus status,
                                   @Param("type") BedType type);

    /**
     * Pessimistic lock for allocation — prevents concurrent double-reservation.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bed b WHERE b.bedId = :id")
    Optional<Bed> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT b.status, COUNT(b) FROM Bed b GROUP BY b.status")
    List<Object[]> countGroupedByStatus();

    long countByStatusAndBedType(BedStatus status, BedType type);

    @Query("SELECT d.departmentName, " +
           "SUM(CASE WHEN b.status = 'AVAILABLE' THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN b.status = 'OCCUPIED' THEN 1L ELSE 0L END), " +
           "COUNT(b.bedId) " +
           "FROM HospitalDepartment d " +
           "LEFT JOIN Bed b ON b.department.departmentId = d.departmentId " +
           "WHERE d.active = true " +
           "GROUP BY d.departmentId, d.departmentName " +
           "ORDER BY d.departmentId")
    List<Object[]> countBedsByDepartment();
}
