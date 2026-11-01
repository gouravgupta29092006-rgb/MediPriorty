-- V12: Seed initial hospital configuration, users, road network, ambulances, beds, and test patients

-- Hospital
INSERT INTO hospital (hospital_id, hospital_name, address, contact_number)
VALUES (1, 'MediPriority Central Hospital', '100 Medical Center Blvd, Metro City', '+1-800-555-0199')
ON DUPLICATE KEY UPDATE hospital_name = VALUES(hospital_name);

-- Departments
INSERT INTO hospital_departments (department_id, hospital_id, department_name, description, active)
VALUES
    (1, 1, 'Emergency & Trauma Center', 'Immediate triage, trauma resuscitation and acute treatment', 1),
    (2, 1, 'Intensive Care Unit (ICU)', 'Level 3 adult ICU with mechanical ventilation and advanced hemodynamic monitoring', 1),
    (3, 1, 'Cardiology Care Unit', 'Dedicated cardiac monitoring beds and emergency cath lab liaison', 1),
    (4, 1, 'General Medicine Ward', 'Inpatient acute medical care and post-stabilization recovery', 1)
ON DUPLICATE KEY UPDATE department_name = VALUES(department_name);

-- Users (Admin@123, Dispatch@123, Doctor@123)
INSERT INTO users (user_id, full_name, email, password_hash, role, active)
VALUES
    (1, 'System Administrator', 'admin@medipriority.com', '$2a$12$pukQPxPDE2FnsVnlmNoa4uRmkFwwP.zs1iwOZ/K2aai58oWbNmjne', 'ADMIN', 1),
    (2, 'Chief Dispatcher', 'dispatcher@medipriority.com', '$2a$12$ca66gzMV2oSR8pTCFsKenOrGCdNstZ7nkZPG/LwN01rBe8VjSAzNe', 'DISPATCHER', 1),
    (3, 'Dr. Sarah Connor, MD', 'doctor@medipriority.com', '$2a$12$ME33FnbHZSdqY.GGM1qPpOrzWpAAWp3axf..Ui9BKMQxhi7RdnrbG', 'MEDICAL_OFFICER', 1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Road Nodes for Dijkstra graph
INSERT INTO road_nodes (node_id, node_name, latitude, longitude, node_type)
VALUES
    (1, 'MediPriority Central Hospital', 40.71280000, -74.00600000, 'HOSPITAL'),
    (2, 'North EMS Station', 40.73280000, -74.00600000, 'AMBULANCE_STATION'),
    (3, 'South EMS Station', 40.69280000, -74.00600000, 'AMBULANCE_STATION'),
    (4, 'Downtown Center Plaza', 40.71800000, -73.99000000, 'PICKUP_ZONE'),
    (5, 'West River Crossing', 40.70800000, -74.02000000, 'INTERSECTION'),
    (6, 'East Highway Junction', 40.72500000, -73.98000000, 'INTERSECTION')
ON DUPLICATE KEY UPDATE node_name = VALUES(node_name);

-- Road Edges
INSERT INTO road_edges (edge_id, source_node_id, destination_node_id, travel_time_minutes, distance_km, bidirectional)
VALUES
    (1, 1, 2, 8.50, 3.200, 1),
    (2, 1, 3, 7.00, 2.800, 1),
    (3, 1, 4, 5.00, 1.900, 1),
    (4, 1, 5, 6.20, 2.400, 1),
    (5, 2, 4, 9.00, 3.800, 1),
    (6, 2, 6, 7.50, 3.100, 1),
    (7, 3, 4, 8.00, 3.000, 1),
    (8, 3, 5, 6.00, 2.200, 1),
    (9, 4, 6, 4.50, 1.600, 1),
    (10, 5, 6, 12.00, 5.000, 1)
ON DUPLICATE KEY UPDATE travel_time_minutes = VALUES(travel_time_minutes);

-- Ambulances
INSERT INTO ambulances (ambulance_id, registration_number, ambulance_type, equipment_level, available_medical_personnel, current_status, current_node_id)
VALUES
    (1, 'MED-AMB-01', 'ADVANCED', 'ALS', 2, 'AVAILABLE', 1),
    (2, 'MED-AMB-02', 'CRITICAL_CARE', 'CRITICAL', 3, 'AVAILABLE', 2),
    (3, 'MED-AMB-03', 'BASIC', 'BLS', 2, 'AVAILABLE', 3),
    (4, 'MED-AMB-04', 'ADVANCED', 'ALS', 2, 'AVAILABLE', 1),
    (5, 'MED-AMB-05', 'CRITICAL_CARE', 'CRITICAL', 3, 'AVAILABLE', 2),
    (6, 'MED-AMB-06', 'BASIC', 'BLS', 2, 'AVAILABLE', 3)
ON DUPLICATE KEY UPDATE registration_number = VALUES(registration_number);

-- Beds (ICU, Emergency, General)
INSERT INTO beds (bed_id, department_id, bed_number, bed_type, status)
VALUES
    (1, 2, 'ICU-101', 'ICU', 'AVAILABLE'),
    (2, 2, 'ICU-102', 'ICU', 'AVAILABLE'),
    (3, 2, 'ICU-103', 'ICU', 'AVAILABLE'),
    (4, 2, 'ICU-104', 'ICU', 'AVAILABLE'),
    (5, 1, 'ER-201', 'EMERGENCY', 'AVAILABLE'),
    (6, 1, 'ER-202', 'EMERGENCY', 'AVAILABLE'),
    (7, 1, 'ER-203', 'EMERGENCY', 'AVAILABLE'),
    (8, 1, 'ER-204', 'EMERGENCY', 'AVAILABLE'),
    (9, 1, 'ER-205', 'EMERGENCY', 'AVAILABLE'),
    (10, 4, 'GEN-301', 'GENERAL', 'AVAILABLE'),
    (11, 4, 'GEN-302', 'GENERAL', 'AVAILABLE'),
    (12, 4, 'GEN-303', 'GENERAL', 'AVAILABLE'),
    (13, 4, 'GEN-304', 'GENERAL', 'AVAILABLE'),
    (14, 4, 'GEN-305', 'GENERAL', 'AVAILABLE'),
    (15, 4, 'GEN-306', 'GENERAL', 'AVAILABLE')
ON DUPLICATE KEY UPDATE bed_number = VALUES(bed_number);

-- Seed Patients
INSERT INTO patients (patient_id, full_name, date_of_birth, gender, contact_number, emergency_contact)
VALUES
    (1, 'Arthur Pendelton', '1965-04-12', 'MALE', '+1-555-0101', 'Eleanor Pendelton (+1-555-0102)'),
    (2, 'Beatrix Potter', '1982-11-23', 'FEMALE', '+1-555-0201', 'Julian Vance (+1-555-0202)'),
    (3, 'Charles Montgomery', '1954-08-30', 'MALE', '+1-555-0301', 'Rachel Montgomery (+1-555-0302)'),
    (4, 'Diana Prince', '1990-06-15', 'FEMALE', '+1-555-0401', 'Hippolyta Prince (+1-555-0402)'),
    (5, 'Edward Nygma', '1978-02-18', 'MALE', '+1-555-0501', 'Kristen Kringle (+1-555-0502)')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
