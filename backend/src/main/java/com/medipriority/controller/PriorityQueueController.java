package com.medipriority.controller;

import com.medipriority.dsa.heap.QueueEntry;
import com.medipriority.dto.response.QueueEntryResponse;
import com.medipriority.service.PriorityQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/priority-queue")
@RequiredArgsConstructor
public class PriorityQueueController {

    private final PriorityQueueService priorityQueueService;

    @GetMapping
    public ResponseEntity<List<QueueEntryResponse>> getQueue() {
        return ResponseEntity.ok(priorityQueueService.getOrderedQueue());
    }

    @GetMapping("/highest")
    public ResponseEntity<QueueEntry> getHighest() {
        QueueEntry entry = priorityQueueService.peekHighestPriority();
        return entry != null ? ResponseEntity.ok(entry) : ResponseEntity.noContent().build();
    }

    @PostMapping("/rebuild")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rebuildQueue() {
        priorityQueueService.rebuildFromDatabase();
        return ResponseEntity.ok().build();
    }
}
