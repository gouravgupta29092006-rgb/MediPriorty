# DSA IMPLEMENTATION — MediPriority

## Overview

All custom data structures are implemented from scratch in:
```
com.medipriority.dsa
```

Java standard collections (ArrayList, HashMap, etc.) are NOT used inside DSA implementations.

---

## 1. PatientPriorityQueue — Binary Min-Heap

**File:** `com.medipriority.dsa.heap.PatientPriorityQueue`

### Purpose
Orders emergency requests so the highest-urgency patient is always at the front.

### Priority Rules (lower value = higher priority)
1. Triage category: RED=1, ORANGE=2, YELLOW=3, GREEN=4
2. Earlier registration timestamp (earlier = higher priority)
3. Lower request_id (deterministic tie-breaker)

### Internal Structure
Array-backed binary heap. Index 0 is unused. Root at index 1.
- Parent of i: `i/2`
- Left child of i: `2*i`
- Right child of i: `2*i+1`

### Operations

| Operation | Description | Complexity |
|---|---|---|
| insert(entry) | Add entry; heapify-up from last position | O(log n) |
| extractMin() | Remove root; replace with last; heapify-down | O(log n) |
| peek() | Return root without removing | O(1) |
| heapifyUp(i) | Bubble element up to restore heap property | O(log n) |
| heapifyDown(i) | Push element down to restore heap property | O(log n) |
| update(requestId, newPriority) | Invalidate old entry; insert new entry | O(log n) |
| rebuild(entries) | Build heap from list using heapify | O(n) |
| size() | Return current count | O(1) |
| isEmpty() | Check if empty | O(1) |

### Versioning / Invalidation Strategy

Each `QueueEntry` carries a `version` counter. When a patient is reassessed:
1. A new `QueueEntry` is inserted with `version = currentVersion + 1`.
2. The old entry is marked `invalidated = true` in a version registry (CustomHashMap).
3. On `extractMin()`, if the extracted entry's version does not match the registry, it is discarded and extraction repeats.

This avoids the complexity of heap-decrease-key and is safe for the expected queue sizes.

### Data Model
```java
class QueueEntry {
    long requestId;
    int priorityValue;       // 1–4
    LocalDateTime registeredAt;
    int version;
    boolean invalidated;
}
```

---

## 2. CustomHashMap — Hash Table with Separate Chaining

**File:** `com.medipriority.dsa.hashmap.CustomHashMap`

### Purpose
Fast O(1) average lookups for: request-to-version mappings, ambulance status caching, and other keyed lookups within the DSA engine.

### Internal Structure
Array of linked-list buckets (Entry nodes, not Java LinkedList).
Default capacity: 16. Load factor threshold: 0.75.

### Hash Function
```
hash(key) = (key.hashCode() ^ (key.hashCode() >>> 16)) & (capacity - 1)
```

### Operations

| Operation | Description | Complexity |
|---|---|---|
| put(key, value) | Hash key; add/update in bucket chain | O(1) avg |
| get(key) | Hash key; search bucket chain | O(1) avg |
| remove(key) | Hash key; unlink node from chain | O(1) avg |
| containsKey(key) | Check if key exists | O(1) avg |
| resize() | Double capacity; rehash all entries | O(n) |
| size() | Current entry count | O(1) |

### Collision Handling
Separate chaining: each bucket is a singly-linked list of `Entry<K, V>` nodes.

---

## 3. HospitalGraph — Weighted Adjacency List Graph

**File:** `com.medipriority.dsa.graph.HospitalGraph`

### Purpose
Models the road network around the hospital. Used by Dijkstra to find shortest paths from ambulance positions to pickup locations.

### Internal Structure
Custom adjacency list using arrays of `GraphEdge[]` (not Java LinkedList).

```java
class GraphEdge {
    int destinationVertex;
    double weight;    // travel_time_minutes
}
```

### Operations

| Operation | Description | Complexity |
|---|---|---|
| addVertex(id) | Register vertex | O(1) |
| addEdge(src, dst, w) | Add weighted directed edge | O(1) |
| getNeighbors(v) | Return edge array for vertex | O(1) |
| getVertexCount() | Count of vertices | O(1) |
| hasVertex(id) | Check vertex exists | O(1) |
| validateEdge(src, dst) | Verify both endpoints exist | O(1) |

### Graph Loading
Graph is loaded from `road_nodes` and `road_edges` tables at application startup and rebuilt if the network changes.

Bidirectional edges are stored as two directed edges.

---

## 4. DijkstraAlgorithm — Shortest Path

**File:** `com.medipriority.dsa.graph.DijkstraAlgorithm`

### Purpose
Find the minimum-weight path between an ambulance's current road node and a patient's pickup node. Returns both the total travel time and the path sequence.

### Algorithm

```
1. Initialize dist[] = INFINITY for all vertices; dist[source] = 0
2. Insert (0, source) into custom min-heap
3. While heap not empty:
   a. Extract (d, u) with minimum distance
   b. If d > dist[u]: skip (stale entry)
   c. For each neighbor v of u with edge weight w:
      - If dist[u] + w < dist[v]:
        - dist[v] = dist[u] + w
        - pred[v] = u
        - Insert (dist[v], v) into heap
4. Reconstruct path using pred[] array
5. Return ShortestPathResult (distance, path list)
```

Uses the custom `PatientPriorityQueue` adapted for vertex-distance pairs (or a parallel generic min-heap).

### Unreachable Detection
If `dist[destination] == INFINITY` after the algorithm completes, the destination is unreachable. The service returns an appropriate error response.

### Complexity
- Time: O((V + E) log V) with binary heap
- Space: O(V) for dist[] and pred[]

---

## 5. CircularQueue — Ring Buffer

**File:** `com.medipriority.dsa.queue.CircularQueue`

### Purpose
Buffer for dispatch events and allocation processing — ensures events are handled in FIFO order without memory reallocation on each operation.

### Internal Structure
Fixed-size array with head and tail pointers.

```
[  ][  ][  ][  ][  ]
 ^           ^
head        tail
```

### Operations

| Operation | Description | Complexity |
|---|---|---|
| enqueue(item) | Add at tail; advance tail mod capacity | O(1) |
| dequeue() | Remove from head; advance head mod capacity | O(1) |
| peek() | View head without removing | O(1) |
| isEmpty() | head == tail | O(1) |
| isFull() | (tail+1) % capacity == head | O(1) |
| size() | (tail - head + capacity) % capacity | O(1) |

### Capacity Management
Initial capacity configurable. When full, capacity doubles and elements are recopied to maintain order (amortized O(1)).

---

## 6. MergeSort — Recursive Merge Sort

**File:** `com.medipriority.dsa.sorting.MergeSort`

### Purpose
Rank candidate ambulances before selection. Sorting criteria:
1. Capability match score (higher = better)
2. Estimated travel time (lower = better)
3. Ambulance ID (deterministic tie-break)

### Algorithm

```
mergeSort(array, comparator):
  if length <= 1: return
  mid = length / 2
  left = mergeSort(array[0..mid])
  right = mergeSort(array[mid..end])
  merge(left, right, comparator)

merge(left, right, comparator):
  i = 0, j = 0, k = 0
  while i < left.length AND j < right.length:
    if comparator(left[i], right[j]) <= 0:
      result[k++] = left[i++]
    else:
      result[k++] = right[j++]
  copy remaining elements
```

### Generics
`MergeSort<T>` accepts a `Comparator<T>` parameter. Works with any object type.

### Complexity
- Time: O(n log n) — all cases
- Space: O(n) — auxiliary array

---

## Test Coverage

Each DSA structure has a dedicated JUnit 5 test class:

| Structure | Test Class |
|---|---|
| PatientPriorityQueue | PatientPriorityQueueTest.java |
| CustomHashMap | CustomHashMapTest.java |
| HospitalGraph | HospitalGraphTest.java |
| DijkstraAlgorithm | DijkstraAlgorithmTest.java |
| CircularQueue | CircularQueueTest.java |
| MergeSort | MergeSortTest.java |

Test scenarios include:
- Standard operations
- Edge cases (empty, full, single element)
- Priority ordering correctness
- Tie-breaking
- Hash collisions
- Graph with unreachable nodes
- Circular queue wraparound
- Merge sort stability
