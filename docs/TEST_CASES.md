# MediPriority — Verified Test Cases & Results Matrix

## 1. Backend Automated Test Suite (31 Tests — 100% Passing)

### 1.1 Custom DSA Tests (`com.medipriority.dsa`)

| Test Class | Test Name | Input / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| `PatientPriorityQueueTest` | `testInsertAndExtractMin` | Inserts patients with scores 1000, 750, 500 | Root extracts 1000, then 750, then 500 | **PASS** |
| `PatientPriorityQueueTest` | `testHeapPropertyAfterMultipleInserts` | 20 randomly ordered patient nodes | Heap invariant $P[\text{parent}] \ge P[\text{child}]$ holds | **PASS** |
| `PatientPriorityQueueTest` | `testExtractFromEmptyHeap` | Heap size = 0 | Throws `NoSuchElementException` gracefully | **PASS** |
| `PatientPriorityQueueTest` | `testPeekWithoutExtraction` | Patient node at root | Returns root element without reducing heap size | **PASS** |
| `PatientPriorityQueueTest` | `testDynamicArrayExpansion` | Exceeds initial capacity of 16 elements | Backing array doubles capacity seamlessly | **PASS** |
| `PatientPriorityQueueTest` | `testTieBreakingByWaitingTime` | Identical priority scores with different timestamps | Older waiting time extracts first | **PASS** |
| `PatientPriorityQueueTest` | `testHeapClear` | Populated heap | Size resets to 0 and array references cleared | **PASS** |
| `CustomHashMapTest` | `testPutAndGet` | 10 key-value pairs inserted | All keys retrieve exact expected values | **PASS** |
| `CustomHashMapTest` | `testCollisionResolution` | Keys mapping to same bucket index | Chained linked nodes resolve correctly | **PASS** |
| `CustomHashMapTest` | `testDynamicRehashing` | Load factor exceeds 0.75 | Bucket array doubles and rehashes keys | **PASS** |
| `CustomHashMapTest` | `testKeyRemoval` | Existing key removed | Map size decrements, subsequent `get` returns null | **PASS** |
| `CustomHashMapTest` | `testContainsKey` | Present and absent keys | Returns true for present, false for absent | **PASS** |
| `CustomHashMapTest` | `testOverwriteExistingKey` | Duplicate key with new value | Value updates in-place without duplicate node | **PASS** |
| `DijkstraAlgorithmTest` | `testShortestPathSimpleGraph` | 3 nodes: A-B (5), B-C (3), A-C (10) | Path A $\rightarrow$ B $\rightarrow$ C selected with weight 8 | **PASS** |
| `DijkstraAlgorithmTest` | `testUnreachableNode` | Disconnected node D | Returns distance $\infty$ and empty path list | **PASS** |
| `DijkstraAlgorithmTest` | `testSelfLoopAndCycle` | Cyclic road segments | Terminates without infinite loop, finds optimal path | **PASS** |
| `DijkstraAlgorithmTest` | `testMultiStationOptimalSelection` | 2 EMS stations at nodes 2 and 3 to pickup node 4 | Selects station with lower cumulative travel time | **PASS** |
| `MergeSortTest` | `testSortArray` | Unsorted integer array | Returns ascending sorted array | **PASS** |
| `MergeSortTest` | `testStability` | Custom objects with equal sort keys | Preserves relative input ordering (stable) | **PASS** |
| `MergeSortTest` | `testSingleAndEmptyArray` | Size 0 and size 1 arrays | Returns array without error | **PASS** |
| `CircularQueueTest` | `testEnqueueDequeue` | Fixed capacity queue (5 elements) | FIFO ordering maintained across wrap-around | **PASS** |
| `CircularQueueTest` | `testQueueFullException` | Enqueueing beyond capacity | Throws `IllegalStateException` | **PASS** |
| `CircularQueueTest` | `testQueueEmptyException` | Dequeueing empty queue | Throws `NoSuchElementException` | **PASS** |
| `CircularQueueTest` | `testWrapAroundIndexCalculation` | Head and tail wrapping around buffer array | Indices calculate modulo capacity accurately | **PASS** |

### 1.2 Service Layer Tests (`com.medipriority.service`)

| Test Class | Test Name | Input / Condition | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| `AmbulanceAllocationServiceTest` | `testSuccessfulDispatch` | Available ambulance at station node 2 | Assigns vehicle, transitions status to `DISPATCHED` | **PASS** |
| `AmbulanceAllocationServiceTest` | `testNoAmbulanceAvailableThrows` | All fleet vehicles in `DISPATCHED` or `MAINTENANCE` | Throws `AllocationFailedException` with clear error | **PASS** |
| `AmbulanceAllocationServiceTest` | `testEquipmentLevelRequirementMatching` | Request requires `ADVANCED` equipment | Ignores `BASIC` ambulances, selects `ADVANCED` | **PASS** |
| `BedAllocationServiceTest` | `testSuccessfulBedReservation` | Available ICU bed in inventory | Reserves bed, links emergency request, returns DTO | **PASS** |
| `BedAllocationServiceTest` | `testConcurrentBedConflictThrows409` | Selected bed updated concurrently by another thread | Catches conflict, throws `ResourceConflictException` | **PASS** |
| `BedAllocationServiceTest` | `testNoBedsAvailable` | Department fully occupied | Throws `AllocationFailedException` | **PASS** |
| `TriageServiceTest` | `testProcessTriageSuccess` | Medical officer signs off triage category RED | Saves triage record, updates request, enqueues patient | **PASS** |

---

## 2. Authentication & Security End-to-End Test Suite (15 Tests)

| ID | Test Scenario | Request Payload | Response Status | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Admin login direct (8080) | `admin@medipriority.com` / `Admin@123` | `200 OK` + JWT + role `ADMIN` | **PASS** |
| **TC-02** | Admin login via Vite proxy (5173) | `admin@medipriority.com` / `Admin@123` | `200 OK` + JWT via proxy | **PASS** |
| **TC-03** | Dispatcher login | `dispatcher@medipriority.com` / `Dispatch@123` | `200 OK` + JWT + role `DISPATCHER` | **PASS** |
| **TC-04** | Medical Officer login | `doctor@medipriority.com` / `Doctor@123` | `200 OK` + JWT + role `MEDICAL_OFFICER` | **PASS** |
| **TC-05** | Invalid password | `admin@medipriority.com` / `WrongPass@999` | `401 Unauthorized` | **PASS** |
| **TC-06** | Non-existent user email | `unknown.user@medipriority.com` | `401 Unauthorized` | **PASS** |
| **TC-07** | Deactivated user account | `inactive@medipriority.com` (`active = 0`) | `403 Forbidden` with deactivation message | **PASS** |
| **TC-08** | Empty email field validation | `""` / `Admin@123` | `400 Bad Request` (`"Email is required"`) | **PASS** |
| **TC-09** | Empty password field validation | `admin@medipriority.com` / `""` | `400 Bad Request` (`"Password is required"`) | **PASS** |
| **TC-10** | Case-insensitive email resolution | `Admin@MediPriority.COM` / `Admin@123` | `200 OK` + valid JWT | **PASS** |
| **TC-11** | Whitespace-padded email trimming | `"   admin@medipriority.com   "` | `200 OK` (auto-trimmed) + valid JWT | **PASS** |
| **TC-12** | Token persistence check (`/api/auth/me`) | Valid Bearer token | `200 OK` with user details | **PASS** |
| **TC-13** | Protected route without token | `GET /api/dashboard` (no header) | `401 Unauthorized` | **PASS** |
| **TC-14** | Role authorization enforcement | Dispatcher accessing `GET /api/users` | `403 Forbidden` | **PASS** |
| **TC-15** | Role authorized access | Admin accessing `GET /api/users` | `200 OK` with users page list | **PASS** |

