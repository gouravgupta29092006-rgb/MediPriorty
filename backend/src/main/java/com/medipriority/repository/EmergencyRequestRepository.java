package com.medipriority.repository;

import com.medipriority.model.EmergencyRequest;
import com.medipriority.model.EmergencyRequest.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {

    List<EmergencyRequest> findByRequestStatusIn(List<RequestStatus> statuses);

    Page<EmergencyRequest> findByPatient_PatientId(Long patientId, Pageable pageable);

    boolean existsByRequestNumber(String requestNumber);

    long countByRequestStatus(RequestStatus status);

    @Query("SELECT er FROM EmergencyRequest er WHERE " +
           "(:status IS NULL OR er.requestStatus = :status) " +
           "ORDER BY er.createdAt DESC")
    Page<EmergencyRequest> findAllFiltered(@Param("status") RequestStatus status, Pageable pageable);

    @Query("SELECT COUNT(er) FROM EmergencyRequest er WHERE er.requestStatus NOT IN " +
           "('CLOSED', 'CANCELLED')")
    long countActiveRequests();
}
