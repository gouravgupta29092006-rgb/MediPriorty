# DATABASE SCHEMA — MediPriority

Database: `medipriority_db`
Engine: InnoDB
Charset: utf8mb4
Collation: utf8mb4_unicode_ci

---

## TABLE 1: users

Stores system users with authentication information and roles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| user_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| full_name | VARCHAR(150) | NOT NULL | Full display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hash |
| role | ENUM('ADMIN','DISPATCHER','MEDICAL_OFFICER') | NOT NULL | System role |
| active | TINYINT(1) | NOT NULL, DEFAULT 1 | Account active flag |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

Indexes: users_email_idx (email), users_role_idx (role), users_active_idx (active)

---

## TABLE 2: hospital

Stores the single hospital configuration.

| Column | Type | Constraints | Description |
|---|---|---|---|
| hospital_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| hospital_name | VARCHAR(200) | NOT NULL | Hospital name |
| address | TEXT | NOT NULL | Full address |
| contact_number | VARCHAR(20) | NOT NULL | Contact phone |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time |

---

## TABLE 3: hospital_departments

Stores departments within the hospital.

| Column | Type | Constraints | Description |
|---|---|---|---|
| department_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| hospital_id | BIGINT | FK -> hospital(hospital_id), NOT NULL | Parent hospital |
| department_name | VARCHAR(150) | NOT NULL | Department name |
| description | TEXT | NULL | Description |
| active | TINYINT(1) | NOT NULL, DEFAULT 1 | Active flag |

Indexes: dept_hospital_idx (hospital_id)

---

## TABLE 4: patients

Stores patient demographic information.

| Column | Type | Constraints | Description |
|---|---|---|---|
| patient_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| full_name | VARCHAR(150) | NOT NULL | Patient full name |
| date_of_birth | DATE | NULL | Date of birth |
| gender | ENUM('MALE','FEMALE','OTHER') | NULL | Gender |
| contact_number | VARCHAR(20) | NULL | Patient phone |
| emergency_contact | VARCHAR(255) | NULL | Emergency contact info |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Registration time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

Indexes: patients_name_idx (full_name), patients_created_idx (created_at)

---

## TABLE 5: emergency_requests

One request per emergency episode. A patient may have multiple requests over time.

| Column | Type | Constraints | Description |
|---|---|---|---|
| request_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| patient_id | BIGINT | FK -> patients(patient_id), NOT NULL | Patient |
| request_number | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable code (e.g., REQ-20261101-0001) |
| request_status | ENUM('PENDING_TRIAGE','TRIAGED','AMBULANCE_DISPATCHED','ARRIVED','BED_RESERVED','ADMITTED','CLOSED','CANCELLED') | NOT NULL, DEFAULT 'PENDING_TRIAGE' | Current status |
| pickup_location | VARCHAR(500) | NOT NULL | Pickup address |
| pickup_latitude | DECIMAL(10,8) | NULL | GPS latitude |
| pickup_longitude | DECIMAL(11,8) | NULL | GPS longitude |
| required_bed_type | ENUM('GENERAL','EMERGENCY','ICU') | NULL | Bed requirement |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Request time |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |
| closed_at | DATETIME | NULL | Closure time |

Indexes: req_patient_idx (patient_id), req_status_idx (request_status), req_created_idx (created_at)

---

## TABLE 6: triage_records

Stores every clinical assessment. Old records are NEVER overwritten.

| Column | Type | Constraints | Description |
|---|---|---|---|
| triage_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| request_id | BIGINT | FK -> emergency_requests(request_id), NOT NULL | Emergency request |
| medical_officer_id | BIGINT | FK -> users(user_id), NOT NULL | Assessing officer |
| triage_category | ENUM('RED','ORANGE','YELLOW','GREEN') | NOT NULL | Priority category |
| clinical_notes | TEXT | NULL | Narrative notes |
| vital_signs_json | JSON | NULL | Structured vital signs |
| assessment_version | INT | NOT NULL, DEFAULT 1 | Version number |
| assessed_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Assessment time |

Indexes: triage_request_idx (request_id), triage_category_idx (triage_category), triage_assessed_idx (assessed_at)

---

## TABLE 7: ambulances

Ambulance inventory.

| Column | Type | Constraints | Description |
|---|---|---|---|
| ambulance_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| registration_number | VARCHAR(50) | UNIQUE, NOT NULL | Vehicle registration |
| ambulance_type | ENUM('BASIC','ADVANCED','CRITICAL_CARE') | NOT NULL | Capability tier |
| equipment_level | ENUM('BLS','ALS','CRITICAL') | NOT NULL | Equipment level |
| available_medical_personnel | INT | NOT NULL, DEFAULT 2 | Staff count |
| current_status | ENUM('AVAILABLE','RESERVED','DISPATCHED','ON_SCENE','RETURNING','MAINTENANCE') | NOT NULL, DEFAULT 'AVAILABLE' | Current status |
| current_node_id | BIGINT | FK -> road_nodes(node_id), NULL | Simulated position |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

Indexes: amb_status_idx (current_status), amb_type_idx (ambulance_type)

---

## TABLE 8: beds

Hospital bed inventory.

| Column | Type | Constraints | Description |
|---|---|---|---|
| bed_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| department_id | BIGINT | FK -> hospital_departments(department_id), NOT NULL | Department |
| bed_number | VARCHAR(20) | NOT NULL | Human identifier |
| bed_type | ENUM('GENERAL','EMERGENCY','ICU') | NOT NULL | Bed category |
| status | ENUM('AVAILABLE','RESERVED','OCCUPIED','CLEANING','MAINTENANCE') | NOT NULL, DEFAULT 'AVAILABLE' | Current status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

Unique constraint: UNIQUE(department_id, bed_number)
Indexes: bed_status_idx (status), bed_type_idx (bed_type), bed_dept_idx (department_id)

---

## TABLE 9: ambulance_allocations

Complete history of ambulance dispatch events.

| Column | Type | Constraints | Description |
|---|---|---|---|
| allocation_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| request_id | BIGINT | FK -> emergency_requests(request_id), NOT NULL | Emergency request |
| ambulance_id | BIGINT | FK -> ambulances(ambulance_id), NOT NULL | Ambulance |
| allocated_by | BIGINT | FK -> users(user_id), NOT NULL | Dispatcher |
| dispatch_time | DATETIME | NULL | Dispatch time |
| arrival_time | DATETIME | NULL | On-scene time |
| completion_time | DATETIME | NULL | Mission completion |
| status | ENUM('ACTIVE','COMPLETED','CANCELLED') | NOT NULL, DEFAULT 'ACTIVE' | Allocation status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation |

Indexes: amb_alloc_request_idx (request_id), amb_alloc_amb_idx (ambulance_id), amb_alloc_status_idx (status)
Unique partial: Prevent duplicate active ambulance allocations per request.

---

## TABLE 10: bed_allocations

Complete history of bed reservation events.

| Column | Type | Constraints | Description |
|---|---|---|---|
| allocation_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| request_id | BIGINT | FK -> emergency_requests(request_id), NOT NULL | Emergency request |
| bed_id | BIGINT | FK -> beds(bed_id), NOT NULL | Bed |
| allocated_by | BIGINT | FK -> users(user_id), NOT NULL | Allocating user |
| reserved_at | DATETIME | NULL | Reservation time |
| admitted_at | DATETIME | NULL | Admission time |
| released_at | DATETIME | NULL | Release time |
| status | ENUM('ACTIVE','COMPLETED','CANCELLED') | NOT NULL, DEFAULT 'ACTIVE' | Allocation status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation |

Indexes: bed_alloc_request_idx (request_id), bed_alloc_bed_idx (bed_id), bed_alloc_status_idx (status)

---

## TABLE 11: road_nodes

Graph vertices representing geographic points.

| Column | Type | Constraints | Description |
|---|---|---|---|
| node_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| node_name | VARCHAR(200) | NOT NULL | Location name |
| latitude | DECIMAL(10,8) | NOT NULL | Latitude |
| longitude | DECIMAL(11,8) | NOT NULL | Longitude |
| node_type | ENUM('HOSPITAL','INTERSECTION','AMBULANCE_STATION','PICKUP_ZONE') | NOT NULL | Node category |

---

## TABLE 12: road_edges

Graph edges representing road segments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| edge_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| source_node_id | BIGINT | FK -> road_nodes(node_id), NOT NULL | Start node |
| destination_node_id | BIGINT | FK -> road_nodes(node_id), NOT NULL | End node |
| travel_time_minutes | DECIMAL(6,2) | NOT NULL | Edge weight (time) |
| distance_km | DECIMAL(6,3) | NOT NULL | Distance |
| bidirectional | TINYINT(1) | NOT NULL, DEFAULT 1 | Is bidirectional |

Indexes: edge_source_idx (source_node_id), edge_dest_idx (destination_node_id)

---

## TABLE 13: audit_logs

Immutable log of all significant user actions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| log_id | BIGINT | PK, AUTO_INCREMENT, NOT NULL | Unique identifier |
| user_id | BIGINT | FK -> users(user_id), NULL | Acting user |
| action | VARCHAR(100) | NOT NULL | Action type |
| entity_type | VARCHAR(100) | NOT NULL | Affected entity type |
| entity_id | BIGINT | NULL | Affected entity ID |
| details_json | JSON | NULL | Additional context |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Log time |

Indexes: audit_user_idx (user_id), audit_action_idx (action), audit_created_idx (created_at)

---

## Key Constraints Summary

| Constraint | Implementation |
|---|---|
| Unique active ambulance allocation | Application + DB-level unique index on (request_id, status='ACTIVE') |
| Unique active bed allocation | Application + DB-level unique index on (bed_id, status='ACTIVE') |
| Valid status transitions | Enforced in Service layer |
| Historical triage records | Never DELETE or UPDATE triage_records rows |
| Bed number uniqueness per dept | UNIQUE(department_id, bed_number) |
| No real patient data in test | Test data uses fictional profiles only |

---

## Flyway Migration Files

```
backend/src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__create_hospital_tables.sql
├── V3__create_patients_table.sql
├── V4__create_emergency_requests_table.sql
├── V5__create_triage_records_table.sql
├── V6__create_ambulances_table.sql
├── V7__create_beds_table.sql
├── V8__create_allocation_tables.sql
├── V9__create_road_network_tables.sql
├── V10__create_audit_logs_table.sql
├── V11__add_indexes.sql
└── V12__seed_initial_data.sql
```
