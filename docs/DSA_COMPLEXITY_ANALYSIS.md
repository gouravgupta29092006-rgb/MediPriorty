# DSA COMPLEXITY ANALYSIS — MediPriority

## 1. PatientPriorityQueue (Binary Min-Heap)

| Operation | Best Case | Average Case | Worst Case | Space |
|---|---|---|---|---|
| insert | O(1) | O(log n) | O(log n) | O(1) |
| extractMin | O(1) | O(log n) | O(log n) | O(1) |
| peek | O(1) | O(1) | O(1) | O(1) |
| heapifyUp | O(1) | O(log n) | O(log n) | O(1) |
| heapifyDown | O(1) | O(log n) | O(log n) | O(1) |
| rebuild (n items) | O(n) | O(n) | O(n) | O(1) |
| update (invalidate + insert) | O(log n) | O(log n) | O(log n) | O(1) |

**Total space:** O(n) for n entries.

**Comparison with Java PriorityQueue:**
Java's PriorityQueue is also a binary heap with the same complexities. MediPriority's implementation adds:
- Versioning for safe reassessment
- Custom comparator for multi-criteria priority
- Stable tie-breaking

---

## 2. CustomHashMap (Hash Table)

| Operation | Best Case | Average Case | Worst Case | Notes |
|---|---|---|---|---|
| put | O(1) | O(1) | O(n) | Worst case: all keys collide |
| get | O(1) | O(1) | O(n) | Worst case: all keys collide |
| remove | O(1) | O(1) | O(n) | Worst case: all keys collide |
| containsKey | O(1) | O(1) | O(n) | |
| resize/rehash | O(n) | O(n) | O(n) | Amortized O(1) per operation |

**Total space:** O(n) for n entries + O(capacity) for bucket array.

**Load factor:** 0.75. When exceeded, capacity doubles and all entries are rehashed.

**Comparison with Java HashMap:**
Similar average case. Java HashMap uses tree-ified buckets (red-black tree) for O(log n) worst case in Java 8+. MediPriority uses simple chaining with singly-linked node lists for clarity.

---

## 3. HospitalGraph (Adjacency List)

| Operation | Time | Space |
|---|---|---|
| addVertex | O(1) | O(1) |
| addEdge | O(1) amortized | O(1) |
| getNeighbors(v) | O(1) | O(1) |
| hasVertex | O(1) | O(1) |

**Total space:** O(V + E) — V vertices, E edges.

**Adjacency matrix alternative:** O(V²) space; O(1) edge lookup. Rejected because the road network is sparse (E << V²).

---

## 4. DijkstraAlgorithm (Shortest Path)

| Metric | Value |
|---|---|
| Time (binary heap) | O((V + E) log V) |
| Time (linear scan) | O(V²) |
| Space | O(V) for dist[] and pred[] |

**Why binary heap?**
The binary heap allows O(log V) extract-minimum instead of O(V) for linear scan. For sparse graphs (E ~ V), this gives O(V log V) which is much better than O(V²).

**Expected graph size:**
The simulated hospital road network has approximately 30–50 nodes. Dijkstra on this scale completes in microseconds.

---

## 5. CircularQueue (Ring Buffer)

| Operation | Time | Space |
|---|---|---|
| enqueue | O(1) amortized | O(1) |
| dequeue | O(1) | O(1) |
| peek | O(1) | O(1) |
| isEmpty | O(1) | O(1) |
| isFull | O(1) | O(1) |
| resize (when full) | O(n) | O(n) |

**Total space:** O(capacity).

**Comparison with Java LinkedList as queue:**
CircularQueue avoids node allocation/GC overhead per enqueue/dequeue. Better cache locality. Fixed capacity with known upper bound.

---

## 6. MergeSort

| Case | Time | Space |
|---|---|---|
| Best | O(n log n) | O(n) |
| Average | O(n log n) | O(n) |
| Worst | O(n log n) | O(n) |

**Stability:** Merge Sort is stable (equal elements maintain relative order).

**Comparison with other sorts:**

| Algorithm | Best | Average | Worst | Stable | In-place |
|---|---|---|---|---|---|
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | Yes | No |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | No | Yes |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | No | Yes |
| Insertion Sort | O(n) | O(n²) | O(n²) | Yes | Yes |

MergeSort chosen because:
- Guaranteed O(n log n) worst case
- Stable (preserves original order for equally-scored ambulances)
- Clear recursive structure appropriate for academic demonstration

**Expected input size:**
Ambulance fleet size is typically 5–20 in the prototype. Merge Sort on this scale is instantaneous. The implementation generalizes to any n.

---

## Overall DSA Engine Complexity

For a complete ambulance dispatch operation:
1. Extract from priority queue: O(log n) — n = active patient requests
2. Retrieve ambulances from DB: O(a) — a = total ambulances
3. Filter by capability: O(a)
4. Run Dijkstra for each candidate: O(a * (V+E) log V)
5. Merge Sort candidates: O(a log a)
6. DB lock + allocate: O(1)

**Total computational complexity:** O(log n + a(V+E) log V + a log a)

For typical values (n=50, a=10, V=40, E=60):
- Very fast; sub-millisecond for DSA operations
- Database I/O dominates total response time
