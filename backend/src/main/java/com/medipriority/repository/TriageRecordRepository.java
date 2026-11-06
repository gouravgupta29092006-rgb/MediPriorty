package com.medipriority.repository;

import com.medipriority.model.TriageRecord;
import com.medipriority.model.TriageRecord.TriageCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TriageRecordRepository extends JpaRepository<TriageRecord, Long> {

    List<TriageRecord> findByEmergencyRequest_RequestIdOrderByAssessmentVersionDesc(Long requestId);

    @Query("SELECT t FROM TriageRecord t WHERE t.emergencyRequest.requestId = :requestId " +
           "AND t.assessmentVersion = (SELECT MAX(t2.assessmentVersion) FROM TriageRecord t2 " +
           "WHERE t2.emergencyRequest.requestId = :requestId)")
    Optional<TriageRecord> findLatestByRequestId(@Param("requestId") Long requestId);

    @Query("SELECT MAX(t.assessmentVersion) FROM TriageRecord t " +
           "WHERE t.emergencyRequest.requestId = :requestId")
    Optional<Integer> findMaxVersionByRequestId(@Param("requestId") Long requestId);

    long countByTriageCategory(TriageCategory category);

    @Query("SELECT t.triageCategory, COUNT(t) FROM TriageRecord t " +
           "WHERE t.assessmentVersion = (SELECT MAX(t2.assessmentVersion) FROM TriageRecord t2 " +
           "WHERE t2.emergencyRequest.requestId = t.emergencyRequest.requestId) " +
           "GROUP BY t.triageCategory")
    List<Object[]> countByTriageCategoryGrouped();

    @Query("SELECT t.triageCategory, COUNT(t) FROM TriageRecord t " +
           "WHERE t.emergencyRequest.requestStatus NOT IN ('CLOSED', 'CANCELLED') " +
           "AND t.assessmentVersion = (SELECT MAX(t2.assessmentVersion) FROM TriageRecord t2 " +
           "WHERE t2.emergencyRequest.requestId = t.emergencyRequest.requestId) " +
           "GROUP BY t.triageCategory")
    List<Object[]> countActiveByTriageCategoryGrouped();
}
