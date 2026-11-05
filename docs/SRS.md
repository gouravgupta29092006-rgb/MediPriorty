# Software Requirements Specification (SRS) — MediPriority

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **MediPriority**, an intelligent priority-based emergency ambulance and hospital bed allocation platform. MediPriority transitions emergency care operations away from vulnerable First-Come, First-Served (FCFS) queuing toward verified clinical urgency triage, deterministic Dijkstra routing, and concurrency-safe resource reservations.

### 1.2 Document Scope
This specification describes the functional requirements, non-functional requirements, data constraints, user roles, and primary use cases for the Spring Boot backend, React web frontend, and MySQL database system.

---

## 2. User Roles & Access Control

| Role | System Scope | Primary Permissions |
| :--- | :--- | :--- |
| **ADMIN** | System-wide administrative oversight | User management (create/toggle users), system audit log inspection, hospital/department configuration, ambulance and bed fleet management, all operational views. |
| **DISPATCHER** | Emergency intake and fleet management | Patient registry entry, emergency request initiation, ambulance dispatch allocation via Dijkstra pathfinding, queue monitoring, transport status updates. |
| **MEDICAL_OFFICER** | Clinical assessment and bed assignment | Formal clinical triage assessment (RED/ORANGE/YELLOW/GREEN scoring), hospital bed reservation and admission, priority queue inspection. |

---

## 3. Functional Requirements

### 3.1 Authentication & User Management (FR-AUTH)
- **FR-AUTH-1:** The system shall authenticate users via email and password using salted BCrypt (strength 12) hashing.
- **FR-AUTH-2:** The system shall issue stateless JWT tokens signed with HMAC-SHA256 containing user ID, role, and expiration timestamp.
- **FR-AUTH-3:** The system shall enforce role-based authorization across all backend REST endpoints and frontend application routes.
- **FR-AUTH-4:** The system shall gracefully reject deactivated user accounts (`active = 0`) with HTTP 403 Forbidden.
- **FR-AUTH-5:** The system shall support administrative user creation and status toggling with immediate permission enforcement.

### 3.2 Patient & Emergency Request Management (FR-REQ)
- **FR-REQ-1:** Dispatchers and Admins shall register patients with identifiers, contact information, date of birth, and emergency contacts.
- **FR-REQ-2:** Dispatchers shall create emergency requests specifying patient ID, pickup coordinates/road node, initial symptom summary, and requester phone.
- **FR-REQ-3:** Each emergency request shall transition through verified states:
  `PENDING_TRIAGE` $\rightarrow$ `TRIAGED` $\rightarrow$ `AMBULANCE_DISPATCHED` $\rightarrow$ `ARRIVED` $\rightarrow$ `BED_RESERVED` $\rightarrow$ `ADMITTED` $\rightarrow$ `CLOSED`.
- **FR-REQ-4:** Requests cannot bypass mandatory triage before ambulance dispatch or bed reservation.

### 3.3 Clinical Triage Assessment (FR-TRIAGE)
- **FR-TRIAGE-1:** Only authenticated Medical Officers or Admins shall perform clinical triage evaluations.
- **FR-TRIAGE-2:** The system shall **never** autonomously diagnose or assign triage categories; clinical determination requires explicit medical officer submission.
- **FR-TRIAGE-3:** Triage levels and target response times:
  - **RED (Critical):** Immediate life threat (respiratory/cardiac arrest, severe trauma, shock) — Target response $\le 8$ minutes. Priority Score: 1000.
  - **ORANGE (High):** Urgent condition (severe chest pain, stroke symptoms, acute asthma) — Target response $\le 15$ minutes. Priority Score: 750.
  - **YELLOW (Moderate):** Serious non-critical condition (compound fracture, moderate hemorrhage) — Target response $\le 30$ minutes. Priority Score: 500.
  - **GREEN (Low):** Minor acute condition (minor lacerations, sprains) — Target response $\le 60$ minutes. Priority Score: 250.
- **FR-TRIAGE-4:** The triage submission shall record clinical notes, assigned category, vital signs summary, and medical officer user ID.

### 3.4 Custom Priority Queue Engine (FR-QUEUE)
- **FR-QUEUE-1:** Triaged emergency requests shall enter a custom array-backed Binary Min-Heap sorted by composite urgency score.
- **FR-QUEUE-2:** The composite priority function evaluates:
  $$\text{Priority} = f(\text{TriageCategoryWeight}, \text{WaitingTimeFactor}, \text{ComorbidityModifiers})$$
- **FR-QUEUE-3:** When high-priority emergencies arrive, the queue shall dynamically adjust without requiring full database table scans.

### 3.5 Intelligent Ambulance Allocation (FR-AMB)
- **FR-AMB-1:** The system shall match patient clinical needs with ambulance equipment levels (`BASIC`, `ADVANCED`, `NEONATAL`).
- **FR-AMB-2:** The system shall calculate the shortest travel time from available EMS stations to the pickup node using a custom from-scratch Dijkstra shortest-path algorithm.
- **FR-AMB-3:** Ambulance allocation shall execute within an atomic transaction with optimistic/pessimistic concurrency controls to prevent duplicate assignment.
- **FR-AMB-4:** Upon dispatch, the ambulance status transitions to `DISPATCHED` and estimated travel time is logged.

### 3.6 Hospital Bed Allocation (FR-BED)
- **FR-BED-1:** The system shall match required care types (`GENERAL`, `EMERGENCY`, `ICU`) with active hospital bed inventory.
- **FR-BED-2:** Bed allocation shall prevent race conditions through transaction-safe updates; conflicting concurrent requests shall return HTTP 409 Conflict.
- **FR-BED-3:** Bed reservation locks the specific bed ID, links it to the active emergency request, and transitions bed status to `OCCUPIED`.

### 3.7 Audit Logging & Analytics (FR-AUDIT)
- **FR-AUDIT-1:** The system shall automatically record all critical operations (login, triage, dispatch, bed reservation, user edits) in the immutable `audit_logs` table.
- **FR-AUDIT-2:** Audit entries shall capture timestamp, user ID, client IP address, action code, entity ID, and structured JSON change details.
- **FR-AUDIT-3:** The Analytics engine shall aggregate operational metrics (response times by triage category, bed occupancy percentages, dispatch turnaround).

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Scalability
- **NFR-PERF-1:** API response times for priority queue operations shall not exceed $50\text{ ms}$ under normal load.
- **NFR-PERF-2:** Dijkstra pathfinding over regional road networks ($\le 1{,}000$ nodes) shall execute in under $10\text{ ms}$.
- **NFR-PERF-3:** Frontend initial load time shall be under $1.5\text{ seconds}$ on standard broadband.

### 4.2 Security & Compliance
- **NFR-SEC-1:** All REST API endpoints (except `/api/auth/login` and public documentation) shall require signed HTTP Bearer JWT authentication.
- **NFR-SEC-2:** Passwords shall be hashed using BCrypt with minimum cost factor 12.
- **NFR-SEC-3:** No stack traces or raw database exceptions shall leak to API clients; all errors shall map through `GlobalExceptionHandler`.
- **NFR-SEC-4:** CORS policy shall strictly filter unauthorized origins.

### 4.3 Data Integrity & Concurrency
- **NFR-DATA-1:** MySQL InnoDB engine shall enforce ACID guarantees for all allocation procedures.
- **NFR-DATA-2:** Foreign key constraints with cascade/restrict rules shall prevent orphaned records across emergency requests, triage records, and allocations.
- **NFR-DATA-3:** Database migrations shall be fully versioned via Flyway.

### 4.4 Usability & Accessibility
- **NFR-UI-1:** The user interface shall provide responsive layout support across modern desktop monitors and tablets ($1024\text{px}+$ viewport).
- **NFR-UI-2:** The application shall support persistent Light and Dark themes with WCAG AA compliant color contrast ratios.
- **NFR-UI-3:** Visual status indicators shall use color-coded badges matching standard medical triage color taxonomy (Red, Orange, Yellow, Green).

---

## 5. System Constraints & Assumptions

1. **Hardware / OS Environment:** Host operating system Windows 10/11 or modern Linux, minimum 8 GB RAM, Java 21 LTS runtime.
2. **Database Engine:** MySQL Server 8.0+ or 9.x using `InnoDB` and `utf8mb4` character set.
3. **Clinical Role Separation:** Non-medical users (e.g. Dispatchers) cannot override or create clinical triage assessments.
4. **Graph Road Network:** Road nodes and weighted edges simulate urban geography; travel times update dynamically based on dispatch requests.

