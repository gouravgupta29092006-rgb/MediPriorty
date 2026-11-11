# ARCHITECTURE — MediPriority

## 1. Architectural Style

Modular Layered Monolith.

A monolithic architecture was chosen for this project because:
- Simplifies academic evaluation and local setup.
- Avoids infrastructure complexity (no Docker, Kubernetes, message brokers).
- Keeps the focus on DSA, Java, and correct business logic.
- The system scope (single hospital) does not require distributed services.

---

## 2. System Layers

```
┌─────────────────────────────────────────────────┐
│                React Frontend                    │
│   (TypeScript, Vite, TanStack Query, Tailwind)  │
└──────────────────┬──────────────────────────────┘
                   │ HTTP REST / JSON
┌──────────────────▼──────────────────────────────┐
│              Spring Boot Backend                  │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │           Spring Security Filter            │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │             Controller Layer                 │ │
│  │  (Input validation, DTO mapping, responses) │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │              Service Layer                   │ │
│  │  (Business logic, transaction management)   │ │
│  └──────┬───────────────────────┬──────────────┘ │
│         │                       │                 │
│  ┌──────▼──────┐    ┌───────────▼──────────────┐ │
│  │  DSA Engine │    │    Repository Layer       │ │
│  │  (Heap,     │    │    (JPA, Hibernate,       │ │
│  │   Graph,    │    │     JPQL, Transactions)   │ │
│  │   Dijkstra, │    └───────────┬──────────────┘ │
│  │   Sort)     │                │                 │
│  └─────────────┘    ┌───────────▼──────────────┐ │
│                     │         MySQL 8            │ │
│                     │  (Source of Truth)        │ │
│                     └───────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

---

## 3. Critical Architectural Rule

**MySQL is the source of truth for resource availability.**

The in-memory DSA engine (priority queue, sorting, Dijkstra) performs computational work — it does NOT determine whether a resource is actually available for allocation.

Before every allocation commit:
1. A database transaction is started.
2. The target resource (ambulance or bed) is locked with SELECT FOR UPDATE (pessimistic lock).
3. Availability is re-verified from the database.
4. Only if still available does the allocation proceed.
5. The transaction is committed or rolled back.

This prevents race conditions when two dispatchers attempt to allocate the same ambulance simultaneously.

---

## 4. Backend Package Structure

```
com.medipriority/
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── SwaggerConfig.java
│   └── ApplicationConfig.java
│
├── controller/
│   ├── AuthController.java
│   ├── PatientController.java
│   ├── EmergencyRequestController.java
│   ├── TriageController.java
│   ├── AmbulanceController.java
│   ├── BedController.java
│   ├── AllocationController.java
│   ├── DashboardController.java
│   ├── UserController.java
│   └── AuditController.java
│
├── service/
│   ├── AuthService.java
│   ├── PatientService.java
│   ├── EmergencyRequestService.java
│   ├── TriageService.java
│   ├── PriorityQueueService.java
│   ├── AmbulanceService.java
│   ├── BedService.java
│   ├── DashboardService.java
│   ├── UserService.java
│   └── AuditService.java
│
├── repository/
│   ├── UserRepository.java
│   ├── PatientRepository.java
│   ├── EmergencyRequestRepository.java
│   ├── TriageRecordRepository.java
│   ├── AmbulanceRepository.java
│   ├── BedRepository.java
│   ├── AmbulanceAllocationRepository.java
│   ├── BedAllocationRepository.java
│   ├── RoadNodeRepository.java
│   ├── RoadEdgeRepository.java
│   └── AuditLogRepository.java
│
├── model/
│   ├── User.java
│   ├── Hospital.java
│   ├── HospitalDepartment.java
│   ├── Patient.java
│   ├── EmergencyRequest.java
│   ├── TriageRecord.java
│   ├── Ambulance.java
│   ├── Bed.java
│   ├── AmbulanceAllocation.java
│   ├── BedAllocation.java
│   ├── RoadNode.java
│   ├── RoadEdge.java
│   └── AuditLog.java
│
├── dto/
│   ├── request/
│   └── response/
│
├── mapper/
│   (MapStruct or manual mappers)
│
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── UserDetailsServiceImpl.java
│   └── SecurityUtils.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── ResourceConflictException.java
│   ├── TriageNotFoundException.java
│   └── AllocationFailedException.java
│
├── util/
│   ├── ResponseBuilder.java
│   └── DateUtils.java
│
├── dsa/
│   ├── heap/
│   │   └── PatientPriorityQueue.java
│   ├── hashmap/
│   │   └── CustomHashMap.java
│   ├── graph/
│   │   ├── HospitalGraph.java
│   │   └── DijkstraAlgorithm.java
│   ├── queue/
│   │   └── CircularQueue.java
│   └── sorting/
│       └── MergeSort.java
│
└── allocation/
    ├── ambulance/
    │   └── AmbulanceAllocationService.java
    └── bed/
        └── BedAllocationService.java
```

---

## 5. Frontend Structure

```
frontend/src/
├── api/
│   ├── axiosClient.ts
│   ├── authApi.ts
│   ├── patientApi.ts
│   ├── triageApi.ts
│   ├── ambulanceApi.ts
│   ├── bedApi.ts
│   ├── allocationApi.ts
│   └── dashboardApi.ts
│
├── components/
│   ├── common/          (Button, Input, Badge, Modal, Table, Pagination)
│   ├── layout/          (Sidebar, TopNav, PageWrapper)
│   ├── dashboard/       (StatCard, AlertPanel, QueuePreview)
│   ├── patients/        (PatientForm, PatientTable)
│   ├── triage/          (TriageForm, TriageHistory, PriorityBadge)
│   ├── ambulances/      (AmbulanceTable, AmbulanceForm, StatusBadge)
│   ├── beds/            (BedGrid, BedFilter, BedStatusBadge)
│   ├── allocations/     (AllocationTable, AllocationCard)
│   └── charts/          (LineChart, BarChart, DonutChart wrappers)
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePriorityQueue.ts
│   └── useWebSocket.ts (future)
│
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PatientRegistrationPage.tsx
│   ├── PatientDirectoryPage.tsx
│   ├── TriagePage.tsx
│   ├── PriorityQueuePage.tsx
│   ├── AmbulancesPage.tsx
│   ├── DispatchPage.tsx
│   ├── BedsPage.tsx
│   ├── BedAllocationPage.tsx
│   ├── AllocationHistoryPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── UsersPage.tsx
│   └── AuditLogsPage.tsx
│
├── routes/
│   └── AppRouter.tsx
│
├── types/
│   └── index.ts
│
└── utils/
    └── helpers.ts
```

---

## 6. Request Lifecycle

```
1. Browser sends HTTP request with Authorization header
2. Spring Security JwtAuthenticationFilter validates token
3. Request reaches Controller
4. Controller validates request DTO using @Valid
5. Controller calls Service method
6. Service applies business logic
   - If allocation: begin @Transactional
   - DSA engine computes priority/ranking/route
   - Repository locks resource (SELECT FOR UPDATE)
   - Resource re-validated from DB
   - Allocation record created
   - Status updated
   - Transaction committed
7. Service returns data to Controller
8. Controller maps to Response DTO
9. Controller returns ResponseEntity with HTTP status
10. Response serialized to JSON and sent to browser
```

---

## 7. Database Consistency Strategy

| Concern | Solution |
|---|---|
| Concurrent ambulance allocation | Pessimistic lock (SELECT FOR UPDATE) |
| Concurrent bed allocation | Pessimistic lock (SELECT FOR UPDATE) |
| Duplicate active allocations | Unique partial index on request_id + ACTIVE status |
| Stale priority queue entries | Version counter; invalidate outdated entries |
| Transaction isolation | READ_COMMITTED minimum |
| Rollback on failure | @Transactional rollbackFor=Exception.class |

---

## 8. Triage Priority Mapping

| Category | Priority Value | Clinical Meaning |
|---|---|---|
| RED | 1 | Immediate — life-threatening |
| ORANGE | 2 | Very urgent |
| YELLOW | 3 | Urgent |
| GREEN | 4 | Non-urgent |

Lower value = higher priority in the min-heap.
Tie-breaking: earlier registration timestamp, then lower request_id.

---

## 9. Multithreading & Asynchronous Concurrency Architecture

### 9.1 Centralized Thread Pools
MediPriority provides structured concurrency through Spring-managed `ThreadPoolTaskExecutor` beans configured in `com.medipriority.config.AsyncConfig`:

1. **`analyticsExecutor`**:
   - Core Pool: 4, Max Pool: 8, Queue Capacity: 100
   - Thread Prefix: `medipriority-analytics-`
   - Rejection Policy: `ThreadPoolExecutor.CallerRunsPolicy`
   - Purpose: Parallel execution of independent read-only database queries (emergency intake, fleet readiness, bed inventory) during dashboard analytics compilation.
2. **`routingExecutor`**:
   - Core Pool: 4, Max Pool: 8, Queue Capacity: 100
   - Thread Prefix: `medipriority-routing-`
   - Rejection Policy: `ThreadPoolExecutor.CallerRunsPolicy`
   - Purpose: Concurrent Dijkstra pathfinding across candidate ambulance stations during automated dispatch.
3. **`backgroundExecutor`**:
   - Core Pool: 2, Max Pool: 4, Queue Capacity: 200
   - Thread Prefix: `medipriority-background-`
   - Purpose: Non-blocking operational maintenance and system health verification.

### 9.2 Thread Safety & Transaction Integrity Guarantees
- **No Shared Mutable State**: The `HospitalGraph` structure is immutable after startup. Dijkstra solvers instantiate local distance arrays and min-heaps per call.
- **Transaction Safety**: All allocation state changes (`AmbulanceAllocationService.doAllocate()`, `BedAllocationService.doAllocate()`) execute within explicit `@Transactional` methods using database-level pessimistic locking (`findByIdWithLock`). Concurrent route estimation happens *before* transactional locking, completely preventing deadlocks.
- **Bounded Timeouts**: All asynchronous `CompletableFuture` workflows define strict timeouts (3–4 seconds) with deterministic fallback handling.

---

## 10. Frontend Medical Loading & Skeleton UI Architecture

### 10.1 Startup Loader (`InitialMedicalLoader.tsx`)
- Renders during initial auth restoration (`/api/auth/me`) before route mounting.
- Prevents protected content flashing and login screen flicker.
- Displays animated SVG ECG heartbeat waveform with stage-by-stage clinical progress indicators.
- Includes network timeout detection with immediate "Retry Gateway" and "Return to Login" actions.

### 10.2 Page Skeleton System (`PageSkeletons.tsx`)
- Provides zero-layout-shift UI placeholders across all 11 application routes.
- Differentiates between initial load (`loading && !data`), background refetches (preserving live UI), and verified empty states.
