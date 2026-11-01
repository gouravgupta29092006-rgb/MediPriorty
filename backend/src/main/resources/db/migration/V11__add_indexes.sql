-- V11: Add performance indexes
CREATE INDEX users_email_idx     ON users(email);
CREATE INDEX users_role_idx      ON users(role);
CREATE INDEX users_active_idx    ON users(active);

CREATE INDEX dept_hospital_idx   ON hospital_departments(hospital_id);

CREATE INDEX patients_name_idx    ON patients(full_name);
CREATE INDEX patients_created_idx ON patients(created_at);

CREATE INDEX req_patient_idx  ON emergency_requests(patient_id);
CREATE INDEX req_status_idx   ON emergency_requests(request_status);
CREATE INDEX req_created_idx  ON emergency_requests(created_at);

CREATE INDEX triage_request_idx  ON triage_records(request_id);
CREATE INDEX triage_category_idx ON triage_records(triage_category);
CREATE INDEX triage_assessed_idx ON triage_records(assessed_at);

CREATE INDEX amb_status_idx ON ambulances(current_status);
CREATE INDEX amb_type_idx   ON ambulances(ambulance_type);

CREATE INDEX bed_status_idx ON beds(status);
CREATE INDEX bed_type_idx   ON beds(bed_type);
CREATE INDEX bed_dept_idx   ON beds(department_id);

CREATE INDEX amb_alloc_request_idx ON ambulance_allocations(request_id);
CREATE INDEX amb_alloc_amb_idx     ON ambulance_allocations(ambulance_id);
CREATE INDEX amb_alloc_status_idx  ON ambulance_allocations(status);

CREATE INDEX bed_alloc_request_idx ON bed_allocations(request_id);
CREATE INDEX bed_alloc_bed_idx     ON bed_allocations(bed_id);
CREATE INDEX bed_alloc_status_idx  ON bed_allocations(status);

CREATE INDEX edge_source_idx ON road_edges(source_node_id);
CREATE INDEX edge_dest_idx   ON road_edges(destination_node_id);

CREATE INDEX audit_user_idx    ON audit_logs(user_id);
CREATE INDEX audit_action_idx  ON audit_logs(action);
CREATE INDEX audit_created_idx ON audit_logs(created_at);
