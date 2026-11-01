package com.medipriority;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MediPriority Application Entry Point.
 *
 * <p>Intelligent Hospital Emergency Ambulance and Bed Allocation System.
 * Uses a custom priority queue (binary min-heap) to process patients
 * by clinical urgency rather than arrival order.
 */
@SpringBootApplication
public class MediPriorityApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediPriorityApplication.class, args);
    }
}
