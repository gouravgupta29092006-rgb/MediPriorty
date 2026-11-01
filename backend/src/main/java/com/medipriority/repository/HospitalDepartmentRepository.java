package com.medipriority.repository;

import com.medipriority.model.HospitalDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalDepartmentRepository extends JpaRepository<HospitalDepartment, Long> {
    List<HospitalDepartment> findByActiveTrue();
    List<HospitalDepartment> findByHospital_HospitalIdAndActiveTrue(Long hospitalId);
}
