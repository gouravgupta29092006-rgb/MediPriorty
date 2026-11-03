# MediPriority — Master Project Plan

## 1. Project Overview & Timeline

MediPriority was designed and developed across structured engineering phases to build a production-style, priority-based hospital emergency ambulance and bed allocation system.

```mermaid
gantt
    title MediPriority Development Timeline & Milestones
    dateFormat  YYYY-MM-DD
    section Phase 1: Architecture & DB
    Domain Modeling & Database Schema       :done,    des1, 2026-10-15, 2026-10-18
    Flyway Migrations (V1 to V12)           :done,    des2, 2026-10-18, 2026-10-21
    section Phase 2: Core DSA
    Binary Min-Heap Priority Queue          :done,    dsa1, 2026-10-21, 2026-10-23
    Custom HashMap & Separate Chaining      :done,    dsa2, 2026-10-23, 2026-10-25
    Weighted Graph & Dijkstra Algorithm     :done,    dsa3, 2026-10-25, 2026-10-27
    MergeSort & Circular Queue Engine       :done,    dsa4, 2026-10-27, 2026-10-28
    section Phase 3: Backend & Security
    Spring Security, BCrypt & JWT           :done,    sec1, 2026-10-28, 2026-10-30
    REST Controllers & Service Layer        :done,    sec2, 2026-10-30, 2026-11-01
    Concurrency & Transaction Management    :done,    sec3, 2026-11-01, 2026-11-02
    section Phase 4: Frontend & UI/UX
    React 18 + Vite Component Architecture  :done,    ui1,  2026-11-01, 2026-11-02
    Clinical UI/UX Redesign (11 Pages)      :done,    ui2,  2026-11-02, 2026-11-02
    Theme Engine (Light/Dark Mode)          :done,    ui3,  2026-11-02, 2026-11-02
    section Phase 5: Verification & Publishing
    End-to-End Testing & Bug Fixes          :done,    ver1, 2026-11-02, 2026-11-03
    CI/CD Automation & GitHub Publishing    :active,  ver2, 2026-11-03, 2026-11-03
```

---

## 2. Phase Deliverables & Work Breakdown

### Phase 1: Database Architecture & Domain Model
- Multi-table relational schema designed in MySQL 8/9.
- 12 incremental Flyway migrations guaranteeing referential integrity:
  - `V1__init_schema.sql` to `V12__seed_initial_data.sql`.
- Indexed lookup fields for email, status, triage category, and foreign keys.

### Phase 2: Custom Data Structures & Algorithms
- Implementation of 5 core from-scratch DSA structures (no Java Collections inside algorithms):
  1. `PatientPriorityQueue` (Array-backed Binary Min-Heap).
  2. `CustomHashMap` (Separate Chaining with dynamically resizing buckets).
  3. `RoadNetworkGraph` (Weighted adjacency-list graph representation).
  4. `DijkstraAlgorithm` (Shortest-path pathfinding using min-heap for priority node expansion).
  5. `MergeSort` & `CircularQueue` (Stable sorting and O(1) buffer streaming).

### Phase 3: Backend Services & API Layer
- Spring Boot 3.3.5 layered architecture:
  - Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ Entities $\rightarrow$ DTOs $\rightarrow$ Mappers.
- Stateless JWT authentication and BCrypt password encryption (strength 12).
- Global exception mapping and field-level validation using Jakarta Bean Validation.

### Phase 4: Frontend Command Center
- React 18 single-page application bundled with Vite.
- Tailwind CSS design system featuring healthcare teal (`#168F83`) palette.
- 11 dedicated functional pages matching clinical dashboard design specifications:
  - Command Center Login, Emergency Command Dashboard, Priority Queue, Patients Directory, Emergency Requests, Clinical Triage, Ambulance Fleet, Bed Management, Allocation History, Emergency Analytics, User Management, and Audit Logs.

### Phase 5: Testing, Hardening & Publishing
- 31 automated backend unit/service test cases.
- Comprehensive authentication regression test covering 15 scenarios.
- GitHub Actions CI workflow for automated Linux builds.
- Complete Markdown documentation suite under `docs/`.

---

## 3. Risk Management & Mitigations

| Identified Risk | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Simultaneous Resource Conflict** | Critical | High | Spring `@Transactional(isolation = Isolation.REPEATABLE_READ)` and optimistic locking with HTTP 409 status returns. |
| **Unauthorized Triage Override** | High | Medium | Role-based `@PreAuthorize("hasAnyRole('MEDICAL_OFFICER', 'ADMIN')")` at the service and method security boundary. |
| **Authentication Form Masking** | Medium | Medium | Pre-submission trimming, case-insensitive repository lookups, and granular error mapping for inactive accounts and network faults. |
| **Port Conflicts on Local Machine** | Low | Medium | Vite proxy forwarding `/api` requests to port `8080` with dynamic fallback origin pattern support. |
