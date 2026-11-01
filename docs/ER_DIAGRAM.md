# ER DIAGRAM — MediPriority

## Entity Relationship Diagram

```mermaid
erDiagram
    users {
        BIGINT user_id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password_hash
        ENUM role
        TINYINT active
        DATETIME created_at
        DATETIME updated_at
    }

    hospital {
        BIGINT hospital_id PK
        VARCHAR hospital_name
        TEXT address
        VARCHAR contact_number
        DATETIME created_at
    }

    hospital_departments {
        BIGINT department_id PK
        BIGINT hospital_id FK
        VARCHAR department_name
        TEXT description
        TINYINT active
    }

    patients {
        BIGINT patient_id PK
        VARCHAR full_name
        DATE date_of_birth
        ENUM gender
        VARCHAR contact_number
        VARCHAR emergency_contact
        DATETIME created_at
        DATETIME updated_at
    }

    emergency_requests {
        BIGINT request_id PK
        BIGINT patient_id FK
        VARCHAR request_number UK
        ENUM request_status
        VARCHAR pickup_location
        DECIMAL pickup_latitude
        DECIMAL pickup_longitude
        ENUM required_bed_type
        DATETIME created_at
        DATETIME updated_at
        DATETIME closed_at
    }

    triage_records {
        BIGINT triage_id PK
        BIGINT request_id FK
        BIGINT medical_officer_id FK
        ENUM triage_category
        TEXT clinical_notes
        JSON vital_signs_json
        INT assessment_version
        DATETIME assessed_at
    }

    ambulances {
        BIGINT ambulance_id PK
        VARCHAR registration_number UK
        ENUM ambulance_type
        ENUM equipment_level
        INT available_medical_personnel
        ENUM current_status
        BIGINT current_node_id FK
        DATETIME created_at
        DATETIME updated_at
    }

    beds {
        BIGINT bed_id PK
        BIGINT department_id FK
        VARCHAR bed_number
        ENUM bed_type
        ENUM status
        DATETIME created_at
        DATETIME updated_at
    }

    ambulance_allocations {
        BIGINT allocation_id PK
        BIGINT request_id FK
        BIGINT ambulance_id FK
        BIGINT allocated_by FK
        DATETIME dispatch_time
        DATETIME arrival_time
        DATETIME completion_time
        ENUM status
        DATETIME created_at
    }

    bed_allocations {
        BIGINT allocation_id PK
        BIGINT request_id FK
        BIGINT bed_id FK
        BIGINT allocated_by FK
        DATETIME reserved_at
        DATETIME admitted_at
        DATETIME released_at
        ENUM status
        DATETIME created_at
    }

    road_nodes {
        BIGINT node_id PK
        VARCHAR node_name
        DECIMAL latitude
        DECIMAL longitude
        ENUM node_type
    }

    road_edges {
        BIGINT edge_id PK
        BIGINT source_node_id FK
        BIGINT destination_node_id FK
        DECIMAL travel_time_minutes
        DECIMAL distance_km
        TINYINT bidirectional
    }

    audit_logs {
        BIGINT log_id PK
        BIGINT user_id FK
        VARCHAR action
        VARCHAR entity_type
        BIGINT entity_id
        JSON details_json
        DATETIME created_at
    }

    hospital ||--o{ hospital_departments : "has"
    hospital_departments ||--o{ beds : "contains"
    patients ||--o{ emergency_requests : "creates"
    emergency_requests ||--o{ triage_records : "assessed by"
    emergency_requests ||--o{ ambulance_allocations : "allocated"
    emergency_requests ||--o{ bed_allocations : "reserved"
    users ||--o{ triage_records : "assesses"
    users ||--o{ ambulance_allocations : "dispatches"
    users ||--o{ bed_allocations : "allocates"
    users ||--o{ audit_logs : "generates"
    ambulances ||--o{ ambulance_allocations : "assigned to"
    ambulances }o--|| road_nodes : "positioned at"
    beds ||--o{ bed_allocations : "assigned to"
    road_nodes ||--o{ road_edges : "source"
    road_nodes ||--o{ road_edges : "destination"
```

## Relationship Summary

| Relationship | Type | Notes |
|---|---|---|
| hospital → hospital_departments | 1:M | One hospital, many departments |
| hospital_departments → beds | 1:M | Beds belong to departments |
| patients → emergency_requests | 1:M | Patient may have multiple emergencies |
| emergency_requests → triage_records | 1:M | Multiple assessments per request |
| emergency_requests → ambulance_allocations | 1:M | Allocation history preserved |
| emergency_requests → bed_allocations | 1:M | Allocation history preserved |
| ambulances → ambulance_allocations | 1:M | Ambulance reused across time |
| beds → bed_allocations | 1:M | Bed reused across time |
| users → triage_records | 1:M | Officer assesses many patients |
| road_nodes → road_edges | 1:M | Each node may connect to many |
