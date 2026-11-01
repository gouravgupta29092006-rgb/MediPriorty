# CHANGELOG — MediPriority

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

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
