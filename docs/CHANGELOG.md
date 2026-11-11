# CHANGELOG — MediPriority

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.8.0] — 2026-11-11

### Added
- **Java Multithreading & Asynchronous Concurrency Architecture:**
  - Implemented centralized `AsyncConfig` with `@EnableAsync` and three bounded, named `ThreadPoolTaskExecutor` thread pools:
    - `analyticsExecutor` (core: 4, max: 8, queue: 100, prefix: `medipriority-analytics-`): concurrent evaluation of emergency metrics, ambulance fleet statistics, and bed occupancy breakdowns.
    - `routingExecutor` (core: 4, max: 8, queue: 100, prefix: `medipriority-routing-`): concurrent Dijkstra shortest path route computations across candidate ambulances during auto-dispatch.
    - `backgroundExecutor` (core: 2, max: 4, queue: 200, prefix: `medipriority-background-`): asynchronous operational maintenance and non-blocking logging.
  - Decomposed `DashboardService.getDashboard()` into 3 independent parallel `CompletableFuture` subtasks joined with a bounded 4-second timeout and graceful error recovery.
  - Added concurrent route queries in `RoadNetworkService` (`estimateTravelTimeAsync`, `estimateMultipleRoutesConcurrently`) and multithreaded candidate evaluation in `AmbulanceAllocationService.autoDispatch()`.
  - Added `AsyncDashboardServiceTest` (2 tests) and `AsyncRoutingTest` (2 tests), expanding test suite to 47 passing tests.
- **Medical-Themed Startup & Loading Experience:**
  - Implemented `InitialMedicalLoader.tsx` matching the MediPriority clinical design system:
    - Subtle ECG heartbeat SVG waveform animation (`animate-ecg` keyframe).
    - Clinical initialization status progression: gateway initialization, session validation, credential check, command center preparation.
    - Network error detection with actionable "Retry Gateway" and "Return to Login" recovery controls.
    - Full light and dark mode compliance (`--bg-primary`, `--bg-surface`, `--accent`).
  - Integrated into `AuthContext`, `ProtectedRoute`, and `Login` to eliminate blank screens, authentication flashing, and premature route redirects.
- **Application-Wide Skeleton UI System:**
  - Created reusable atomic skeleton primitives: `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonTable`, `SkeletonChart`.
  - Created dedicated layout-matching page skeletons in `PageSkeletons.tsx`:
    - `DashboardSkeleton`
    - `PriorityQueueSkeleton`
    - `EmergencyRequestsSkeleton`
    - `TriageSkeleton`
    - `AmbulancesSkeleton`
    - `BedsSkeleton`
    - `PatientsSkeleton`
    - `AllocationsSkeleton`
    - `AnalyticsSkeleton`
    - `UsersSkeleton`
    - `AuditLogsSkeleton`
  - Integrated across all 11 frontend pages, cleanly differentiating initial loading states from background data refetches.

---

## [0.7.0] — 2026-11-06

### Fixed
- **Priority Queue Lifecycle & Patient Discharge Integrity:**
  - Excluded `CLOSED`, `ADMITTED`, and `CANCELLED` emergency requests from appearing in the Priority Min-Heap queue.
  - Added `isQueueEligible()` predicate to `EmergencyRequest` model to centralize queue eligibility (`TRIAGED`, `AMBULANCE_DISPATCHED`, `ARRIVED`, `BED_RESERVED`).
  - Added `findQueueEligibleRequests()` to `EmergencyRequestRepository` to strictly query active requests with valid triage records.
  - Updated `PriorityQueueService` to rebuild and synchronize with MySQL on every `getOrderedQueue()` and `peekHighestPriority()` call.
  - Added `handleRequestLifecycleChange()` in `PriorityQueueService` called by `BedAllocationService` and `EmergencyRequestService` on status transitions.
- **Dispatcher-Only Ambulance Authorization:**
  - Restricted ambulance dispatch endpoints (`POST /api/allocations/ambulance/auto`, `POST /api/allocations/ambulance/manual`, `PATCH /api/allocations/ambulance/*/arrived`, `PATCH /api/allocations/ambulance/*/complete`) strictly to `DISPATCHER` role.
  - Denied access to `ADMIN` and `MEDICAL_OFFICER` roles with HTTP 403 Forbidden.
  - Added dedicated `AuthenticationEntryPoint` in `SecurityConfig` returning HTTP 401 Unauthorized with JSON error payload for unauthenticated requests.
  - Updated frontend pages (`AmbulancesPage`, `Dashboard`, `EmergencyRequestsPage`, `PriorityQueuePage`) to hide dispatch action buttons for non-dispatchers and render role restriction notices.
- **Queue Synchronization & Frontend Responsiveness:**
  - Automated heap invalidation and reconstruction during admissions, releases, dispatches, and arrivals.
  - Shortened polling interval in `PriorityQueuePage` to 4s for responsive real-time queue synchronization.

### Added
- `PriorityQueueLifecycleTest` with 6 unit tests covering:
  - Empty queue handling
  - Exclusion of closed and discharged requests
  - Exclusion of admitted and cancelled requests
  - Strict clinical urgency ordering (RED > ORANGE > YELLOW > GREEN)
  - Tie-breaking on registration timestamp and request ID
  - Lifecycle change eviction of discharged patients
- `AmbulanceDispatchAuthorizationTest` with 6 MockMvc security tests covering:
  - Dispatcher permitted to auto-dispatch
  - Admin forbidden from auto-dispatching (403)
  - Medical officer forbidden from auto-dispatching (403)
  - Unauthenticated request returns 401 Unauthorized
  - Admin forbidden from completing ambulance runs (403)
  - Dispatcher permitted to complete ambulance runs

---

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
