package com.medipriority.repository;

import com.medipriority.model.RoadNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadNodeRepository extends JpaRepository<RoadNode, Long> {
    List<RoadNode> findByNodeType(RoadNode.NodeType nodeType);
}
