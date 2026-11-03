# MediPriority — Database Setup & Migrations Guide

## 1. Initial MySQL Configuration

### 1.1 Create Database & Application User
Open MySQL command-line or Workbench as `root` and execute:

```sql
-- 1. Create the database with UTF-8 support
CREATE DATABASE IF NOT EXISTS medipriority_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create the application user
CREATE USER IF NOT EXISTS 'medipriority_user'@'localhost' IDENTIFIED BY 'changeme';
CREATE USER IF NOT EXISTS 'medipriority_user'@'127.0.0.1' IDENTIFIED BY 'changeme';

-- 3. Grant full DDL and DML privileges
GRANT ALL PRIVILEGES ON medipriority_db.* TO 'medipriority_user'@'localhost';
GRANT ALL PRIVILEGES ON medipriority_db.* TO 'medipriority_user'@'127.0.0.1';

-- 4. Apply privilege updates
FLUSH PRIVILEGES;
```

---

## 2. Automated Flyway Migrations

MediPriority manages database schema evolution deterministically using Flyway. All migrations are located in:
`backend/src/main/resources/db/migration/`

When the Spring Boot backend boots, Flyway automatically verifies and applies pending migrations:

| Migration Script | Description |
| :--- | :--- |
| `V1__init_schema.sql` | Core domain tables (`hospital`, `departments`, `users`, `patients`) |
| `V2__emergency_requests.sql` | Emergency request records with state machine status enum |
| `V3__triage_records.sql` | Clinical triage assessment records, category weights, and notes |
| `V4__ambulances.sql` | Vehicle fleet inventory, equipment level, and station links |
| `V5__beds.sql` | Hospital beds inventory, care types (`GENERAL`, `EMERGENCY`, `ICU`), and status |
| `V6__road_network.sql` | Simulated urban road network nodes and intersections for Dijkstra |
| `V7__road_edges.sql` | Weighted road segments with distance in km and estimated travel time |
| `V8__ambulance_allocations.sql` | Dispatch allocation history with travel time logging |
| `V9__bed_allocations.sql` | Bed reservation records and admission timestamps |
| `V10__audit_logs.sql` | Immutable audit log table with JSON payload tracking |
| `V11__indexes_and_constraints.sql` | Performance indexes on lookups, status filters, and foreign keys |
| `V12__seed_initial_data.sql` | Seed hospital config, demo accounts, EMS stations, and road network |

---

## 3. Seeded Accounts & Master Data

The seed migration automatically inserts:
- **Central Hospital:** MediPriority Central Hospital (100 Medical Center Blvd).
- **Departments:** Emergency & Trauma Center, Intensive Care Unit (ICU), Cardiology Care Unit, General Medicine Ward.
- **6 Road Nodes & 10 Weighted Edges:** Connecting North EMS Station, South EMS Station, Central Hospital, Downtown Plaza, River Crossing, and Highway Junction.
- **Demo Users (BCrypt Hashes):**
  - `admin@medipriority.com` / `Admin@123` (Role: `ADMIN`)
  - `dispatcher@medipriority.com` / `Dispatch@123` (Role: `DISPATCHER`)
  - `doctor@medipriority.com` / `Doctor@123` (Role: `MEDICAL_OFFICER`)

---

## 4. Verification & Diagnostics

Verify that all tables and seed records are active:
```powershell
mysql -u medipriority_user -pchangeme -e "USE medipriority_db; SHOW TABLES; SELECT user_id, email, role, active FROM users;"
```
Expected output: 12 tables and 3 active demo accounts.
