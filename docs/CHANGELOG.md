# CHANGELOG — MediPriority

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.6.0] — 2026-11-06

### Fixed
- **Dashboard Metric Scoping & Data Integrity:**
  - Resolved phantom critical alerts and false triage severity numbers by scoping `TriageRecordRepository` aggregations strictly to active emergency requests (`requestStatus NOT IN ('CLOSED', 'CANCELLED')`).
  - When zero active emergency requests are present, the critical alert banner now cleanly stays hidden, and triage distribution counts accurately show 0.
- **Analytics Charts Repair & Complete Data Wiring:**
  - **Chart A (Triage Urgency Category Distribution):** Handled zero-active state with a dedicated empty-state visual card; wired active-only counts with severity colors and formatted tooltips.
  - **Chart B (Ambulance Fleet Readiness Status):** Added missing `MAINTENANCE` status reporting, accurately accounting for all 6 ambulance operational states.
  - **Chart C (Bed Availability by Department):** Replaced hardcoded bed categories with dynamic database query `countBedsByDepartment()` querying all real hospital departments (`Emergency & Trauma Center`, `Intensive Care Unit (ICU)`, `Cardiology Care Unit`, `General Medicine Ward`). Fixed label clipping by rotating X-axis labels `-15°`, adding bottom margin, and expanding vertical chart height.
- **Clinical Terminology Modernization:**
  - Replaced computer-science/algorithmic labels across the Priority Queue page (`Ordered Heap Nodes` -> `Emergency Patient Priority List`, `Heap Rebuild O(n)` -> `Refresh Priority List`, `Heap Queue is Empty` -> `No Pending Emergency Allocations`).
  - Modernized the Ambulance Fleet page: replaced `Dijkstra Shortest Path Probe` with `Ambulance Route & Travel-Time Estimator`, `Source Node` / `Destination Node` with `Starting Location` / `Destination`, `Calculate Route Weight` with `Calculate Route`, and graph node keys with clear station/district designations.

### Added
- `DepartmentBedStats` DTO in backend response model to provide real department-level bed aggregation.
- `maintenanceAmbulances` count in `DashboardResponse` for complete fleet inventory tracking.

---

## [0.5.0] — 2026-11-02

### Added
- Complete UI/UX redesign using the reference images for a modern, minimal healthcare SaaS appearance.
- Comprehensive CSS custom property design token system (`--bg-primary`, `--bg-surface`, `--accent`, `--border`, etc.).
- Full Light and Dark mode theming with `ThemeContext`, `localStorage` persistence, and Sun/Moon toggle.
- Redesigned Application Shell:
  - Sidebar: Brand logo with teal accent, clean uppercase section grouping, active item highlight, and profile card.
  - Navbar: Hospital branding, pulse online status badge, live monospace clock, and theme switcher.
- Redesigned all 11 pages matching provided reference dashboards:
  - `Login.tsx`: Minimal light card layout with quick demo credentials.
  - `Dashboard.tsx`: Executive command center with 4 KPI cards, triage severity strip, and min-heap queue summary.
  - `PriorityQueuePage.tsx`: Explainer card for binary min-heap tie-breaking and ordered candidates list.
  - `EmergencyRequestsPage.tsx`: Filter tabs, status tags, and incident intake modal.
  - `TriagePage.tsx`: Categorization cards (RED P1, ORANGE P2, YELLOW P3, GREEN P4), vitals grid, and immutable audit history.
  - `BedsPage.tsx`: Interactive bed card grid, status filters, and automatic reservation trigger.
  - `PatientsPage.tsx`: Patient directory with search, gender tags, and registration form.
  - `AllocationsHistoryPage.tsx`: Tabbed timeline for ambulance dispatches and bed allocations.
  - `AnalyticsPage.tsx`: Donut and bar chart metrics using Recharts.
  - `AmbulancesPage.tsx`, `UsersPage.tsx`, `AuditLogsPage.tsx`: Consistent design token styling.

---

## [0.4.0] — 2026-11-01

### Added
- Local MySQL 9.7 database integration (`medipriority_db` and dedicated `medipriority_user`).
- Executed all 12 Flyway schema migrations (V1–V12) with full seed datasets.
- Successfully launched Spring Boot backend on `http://localhost:8080` (Tomcat) with OpenAPI / Swagger UI.
- Successfully launched React 18 + Vite development server on `http://localhost:5173`.
- Verified end-to-end integration across all 10 core clinical and operational workflows.

### Fixed
- Fixed Jackson serialization `HttpMessageConversionException` on lazy-loaded Hibernate `ByteBuddyInterceptor` proxies in `AuditLog` by adding `@JsonIgnoreProperties` and masking `User.passwordHash` with `@JsonIgnore`.

---

## [0.3.0] — 2026-11-01


### Added
- Complete React 18 + TypeScript + Vite + Tailwind CSS frontend application.
- Dark theme healthcare command center UI (#0B1220, #0D1728, #111C2E, #2563EB).
- 12 comprehensive frontend pages:
  - `Login`: Authentication with quick demo role switcher (Admin, Dispatcher, Doctor).
  - `Dashboard`: Real-time KPI summary, live priority queue preview, urgency distribution.
  - `PriorityQueuePage`: Interactive visualizer for custom binary min-heap with tie-breaking and version badges.
  - `PatientsPage`: Patient directory with search and registration modal.
  - `EmergencyRequestsPage`: Incident creation with GPS coordinates, bed requirement, and status filtering.
  - `TriagePage`: Clinical triage assessment with objective vital signs capture and version history.
  - `AmbulancesPage`: Fleet management, Dijkstra shortest path calculator, and automated/manual dispatch.
  - `BedsPage`: Departmental bed visualizer (ICU, Emergency, General) with auto-reservation, admission, and discharge.
  - `AllocationsHistoryPage`: Audit log timeline for ambulance runs and bed occupancies.
  - `AnalyticsPage`: Recharts visualizations for triage severity, bed capacity, and fleet readiness.
  - `UsersPage`: Staff provisioning and account activation/deactivation.
  - `AuditLogsPage`: System-wide compliance and audit log table.
- Axios client configured with JWT request interceptor and 401 automatic redirect.
- Protected route guards with role-based authorization.

---

## [0.2.0] — 2026-11-01

### Added
- Eclipse Temurin JDK 21 LTS installed and configured in `backend/mvnw.cmd`.
- Apache Maven 3.9.9 configured with Lombok annotation processor path.
- Custom Data Structures and Algorithms package (`com.medipriority.dsa`):
  - `PatientPriorityQueue`: Array-backed binary min-heap with multi-tier tie-breaking.
  - `CustomHashMap`: Separate-chaining hash table with dynamic resizing.
  - `HospitalGraph` & `DijkstraAlgorithm`: Adjacency list directed graph with custom min-heap shortest path solver.
  - `CircularQueue`: Ring buffer FIFO queue.
  - `MergeSort`: Generic recursive merge sort for ranking candidate ambulances.
- Full suite of Spring Boot 3 REST Controllers:
  - `AuthController`, `DashboardController`, `PatientController`, `EmergencyRequestController`, `TriageController`, `PriorityQueueController`, `AmbulanceController`, `BedController`, `AllocationController`, `UserController`, `AuditController`, `RoadNetworkController`.
- Helper class `SecurityUtil` for extracting user credentials and roles from the SecurityContext.
- Complete Flyway migration scripts (V1 through V12) including rich seed data for hospital departments, seed credentials, road network nodes/edges, ambulances, beds, and initial patients.
- Comprehensive unit test suite with 31 tests passing (24 DSA tests and 7 service tests).

---

## [0.1.0] — 2026-11-01

### Added
- Complete project documentation suite (Phase 1).
- Architecture, schema, and API specifications.
