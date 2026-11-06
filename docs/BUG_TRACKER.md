# BUG TRACKER — MediPriority

## Open Bugs

None. All discovered bugs have been resolved and verified by automated unit tests.

---

## Resolved Bugs

### BUG-001: JDK 25 Compiler Incompatibility with Lombok 1.18.34
- **Date Found:** 2026-11-01
- **Severity:** CRITICAL
- **Description:** `mvn compile` threw `Fatal error compiling: java.lang.ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN`.
- **Root Cause:** Environment defaulted to JDK 25.0.1. Javac in JDK 25 altered internal `TypeTag` definitions that broke Lombok's annotation processor.
- **Resolution:** Installed Eclipse Temurin JDK 21.0.13 LTS via winget and configured `backend/mvnw.cmd` with `JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"`. Also configured `annotationProcessorPaths` in `maven-compiler-plugin`.
- **Status:** RESOLVED

### BUG-002: Missing SecurityUtil Helper Class
- **Date Found:** 2026-11-01
- **Severity:** HIGH
- **Description:** `PatientController.java` referenced `com.medipriority.util.SecurityUtil` which had not been created.
- **Root Cause:** Incomplete recovery from prior session.
- **Resolution:** Implemented `SecurityUtil.java` with static methods for extracting `getCurrentUserId()`, `getCurrentUserEmail()`, and `getCurrentUserRole()` from Spring `SecurityContextHolder`.
- **Status:** RESOLVED

### BUG-003: Allocation Endpoints Role Restriction on Bed Management
- **Date Found:** 2026-11-01
- **Severity:** MEDIUM
- **Description:** In `SecurityConfig.java`, `/api/allocations/**` only permitted `DISPATCHER` and `ADMIN`, denying `MEDICAL_OFFICER` access to bed allocations.
- **Root Cause:** Overly restrictive rule mapping.
- **Resolution:** Updated `SecurityConfig.java` to grant `hasAnyRole("DISPATCHER", "MEDICAL_OFFICER", "ADMIN")` on `/api/allocations/**`.
- **Status:** RESOLVED

### BUG-004: PatientPriorityQueueTest Lazy Eviction Assertion
- **Date Found:** 2026-11-01
- **Severity:** LOW
- **Description:** `PatientPriorityQueueTest.testReassessmentVersioning` asserted `isEmpty()` before extracting the stale version node.
- **Root Cause:** Reassessment creates a new entry with an incremented version; stale entries are lazily discarded during traversal/extraction.
- **Resolution:** Adjusted test assertion to extract until `null` is returned, verifying lazy eviction of stale entries.
- **Status:** RESOLVED

### BUG-005: Jackson HttpMessageConversionException on Hibernate Lazy Proxy (AuditLog)
- **Date Found:** 2026-11-01
- **Severity:** MEDIUM
- **Description:** `GET /api/audit-logs` resulted in HTTP 500 error: `HttpMessageConversionException: Type definition error: [simple type, class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor]`.
- **Root Cause:** `AuditLog.user` is a lazy-loaded Hibernate proxy. Jackson ObjectMapper attempted to serialize internal ByteBuddy proxy interception fields and unmasked passwordHash.
- **Resolution:** Added `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` to `User` and `AuditLog`, and added `@JsonIgnore` to `User.passwordHash`.
- **Status:** RESOLVED

### BUG-006: Phantom Critical Triage Alert & Inconsistent Triage Counts on Inactive Queue
- **Date Found:** 2026-11-06
- **Severity:** HIGH
- **Description:** When 0 active emergencies were pending, the Dashboard alert banner claimed 3 patients in Category RED, and triage severity breakdown reported RED: 3, ORANGE: 1, YELLOW: 1.
- **Root Cause:** `TriageRecordRepository.countByTriageCategoryGrouped()` aggregated all historical triage records without scoping by `requestStatus NOT IN ('CLOSED', 'CANCELLED')`.
- **Resolution:** Created `countActiveByTriageCategoryGrouped()` in `TriageRecordRepository` scoping by active requests only. Updated `DashboardService` to source critical counts and triage distribution exclusively from active episodes.
- **Status:** RESOLVED

### BUG-007: Analytics Bed Availability Chart Clipped Labels & Missing Real Departments
- **Date Found:** 2026-11-06
- **Severity:** MEDIUM
- **Description:** Bed Availability chart hardcoded bed type keys (`ICU Beds`, `Emergency Trauma`, `General Medicine`), omitting the database's fourth department (`Cardiology Care Unit`), and X-axis labels clipped along the bottom edge.
- **Root Cause:** Missing department-level bed aggregation query in backend, and absence of bottom margins/label rotation in frontend Recharts layout.
- **Resolution:** Implemented `countBedsByDepartment()` in `BedRepository`, created `DepartmentBedStats` DTO, wired into `DashboardResponse`, and modernized `AnalyticsPage.tsx` with `-15°` angled text, bottom margin, and empty-state fallbacks.
- **Status:** RESOLVED

### BUG-008: Incomplete Ambulance Fleet Readiness Reporting (Missing Maintenance State)
- **Date Found:** 2026-11-06
- **Severity:** LOW
- **Description:** Ambulance Fleet Readiness Status doughnut and KPI cards omitted vehicles under maintenance, causing fleet count mismatches.
- **Root Cause:** `DashboardResponse` lacked `maintenanceAmbulances` field and frontend only summed available + dispatched.
- **Resolution:** Added `maintenanceAmbulances` count to `DashboardResponse`, included maintenance status in `fleetData`, and recalculated total fleet from all 6 status categories.
- **Status:** RESOLVED

### BUG-009: Discharged/Closed Patients Retained in Priority Queue
- **Date Found:** 2026-11-06
- **Severity:** HIGH
- **Description:** Discharged and CLOSED patients (such as Naman) lingered in the Priority Min-Heap queue and appeared as active candidates.
- **Root Cause:** In-memory `PatientPriorityQueue` did not evict nodes upon request state transition to `CLOSED`, `ADMITTED`, or `CANCELLED`. Additionally, `rebuildFromDatabase()` used `findByRequestStatusIn()` with an incomplete set of statuses and did not check `isQueueEligible()`.
- **Resolution:** Implemented `EmergencyRequest.isQueueEligible()`, `EmergencyRequestRepository.findQueueEligibleRequests()`, and updated `PriorityQueueService.getOrderedQueue()` and `peekHighestPriority()` to rebuild from database on every query. Connected `handleRequestLifecycleChange()` in `BedAllocationService`, `AmbulanceAllocationService`, and `EmergencyRequestService`. Verified with `PriorityQueueLifecycleTest` (6 tests).
- **Status:** RESOLVED

### BUG-010: Unauthorized Roles (ADMIN / MEDICAL_OFFICER) Permitted to Dispatch Ambulances
- **Date Found:** 2026-11-06
- **Severity:** HIGH
- **Description:** System Administrator and Medical Officer roles had access to trigger automated and manual ambulance dispatches, violating separation of clinical and dispatch roles.
- **Root Cause:** `AllocationController` ambulance dispatch endpoints permitted `ADMIN` alongside `DISPATCHER`, and `SecurityConfig.java` allowed broad allocation endpoints. Frontend displayed dispatch buttons for non-dispatcher roles.
- **Resolution:** Restricted `/api/allocations/ambulance/**` strictly to `hasRole('DISPATCHER')` in both `SecurityConfig` and `@PreAuthorize` in `AllocationController`. Added `AuthenticationEntryPoint` in `SecurityConfig` to return structured 401 Unauthorized for unauthenticated requests. In frontend (`AmbulancesPage.tsx`, `Dashboard.tsx`, `EmergencyRequestsPage.tsx`, `PriorityQueuePage.tsx`), wrapped dispatch controls in role check (`hasRole(['DISPATCHER'])`) and displayed restricted notice banners. Verified with `AmbulanceDispatchAuthorizationTest` (6 tests).
- **Status:** RESOLVED

### BUG-011: Priority Queue Stale State After Lifecycle Changes
- **Date Found:** 2026-11-06
- **Severity:** MEDIUM
- **Description:** Priority queue and dashboard previews did not immediately reflect admissions, discharges, or ambulance arrivals without manual page refresh.
- **Root Cause:** Background service lifecycle handlers mutated database request status without evicting or rebuilding in-memory heap representations, while frontend polling interval (8s) caused perceived UI lag.
- **Resolution:** Added automatic queue rebuilding in all lifecycle service transitions (`admit`, `release`, `doAllocate`, `markArrived`), reduced frontend polling interval in `PriorityQueuePage.tsx` from 8000ms to 4000ms, and invalidated stale heap nodes directly in `getOrderedQueue()`.
- **Status:** RESOLVED


