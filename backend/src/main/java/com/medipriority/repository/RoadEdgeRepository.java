package com.medipriority.repository;

import com.medipriority.model.RoadEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadEdgeRepository extends JpaRepository<RoadEdge, Long> {
    List<RoadEdge> findBySourceNode_NodeId(Long sourceNodeId);
}
