package com.medipriority.dsa.heap;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Custom Binary Min-Heap — Patient Priority Queue.
 *
 * <p>Array-backed binary min-heap that orders emergency requests by clinical urgency.
 * Implements the standard binary heap operations from scratch.
 * Does NOT use Java's PriorityQueue internally.
 *
 * <p><b>Priority Rules (lower value = higher urgency):</b>
 * <ol>
 *   <li>Triage category: RED=1, ORANGE=2, YELLOW=3, GREEN=4</li>
 *   <li>Earlier registration time wins ties</li>
 *   <li>Lower requestId wins remaining ties (deterministic)</li>
 * </ol>
 *
 * <p><b>Versioning for reassessment:</b>
 * When a patient is reassessed, a new QueueEntry with incremented version is inserted.
 * The version registry (backed by CustomHashMap) tracks the current valid version
 * per requestId. On extractMin(), entries with stale versions are silently discarded.
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>insert:       O(log n)</li>
 *   <li>extractMin:   O(log n)</li>
 *   <li>peek:         O(1)</li>
 *   <li>rebuild:      O(n)</li>
 * </ul>
 *
 * <p><b>Space:</b> O(n)
 *
 * @author MediPriority DSA Module
 */
public class PatientPriorityQueue {

    private static final int DEFAULT_CAPACITY = 16;

    // 1-indexed heap: root at index 1; index 0 unused
    private QueueEntry[] heap;
    private int size;
    private int capacity;

    // Version registry: requestId -> current valid version
    // Uses a simple parallel array approach (or CustomHashMap can be injected)
    // For simplicity and no dependency, we use a local version map backed by
    // parallel arrays; in integration with Spring, CustomHashMap is injected.
    private final com.medipriority.dsa.hashmap.CustomHashMap<Long, Integer> versionRegistry;

    // ============================================================
    //  Construction
    // ============================================================

    /**
     * Creates a PatientPriorityQueue with default initial capacity of 16.
     */
    public PatientPriorityQueue() {
        this(DEFAULT_CAPACITY);
    }

    /**
     * Creates a PatientPriorityQueue with the given initial capacity.
     *
     * @param initialCapacity initial array capacity (must be >= 1)
     */
    public PatientPriorityQueue(int initialCapacity) {
        if (initialCapacity < 1) {
            throw new IllegalArgumentException("Capacity must be at least 1");
        }
        this.capacity = initialCapacity;
        this.heap = new QueueEntry[capacity + 1]; // +1 because index 0 is unused
        this.size = 0;
        this.versionRegistry = new com.medipriority.dsa.hashmap.CustomHashMap<>();
    }

    // ============================================================
    //  Public Operations
    // ============================================================

    /**
     * Inserts a new queue entry into the heap.
     * Registers this version as the current valid version for requestId.
     *
     * <p>Time: O(log n)
     *
     * @param entry the entry to insert
     */
    public void insert(QueueEntry entry) {
        if (entry == null) {
            throw new IllegalArgumentException("QueueEntry must not be null");
        }

        // Register this version as the active version
        versionRegistry.put(entry.getRequestId(), entry.getVersion());

        // Grow if needed
        if (size >= capacity) {
            resize();
        }

        // Place at the end and bubble up
        size++;
        heap[size] = entry;
        heapifyUp(size);
    }

    /**
     * Removes and returns the highest-priority entry.
     * Skips entries whose version no longer matches the version registry
     * (i.e., the patient was reassessed and this is an outdated entry).
     *
     * <p>Time: O(log n) amortized
     *
     * @return the highest-priority valid entry, or null if queue is empty
     */
    public QueueEntry extractMin() {
        while (size > 0) {
            QueueEntry candidate = extractRaw();
            // Check if this entry is the current valid version
            Integer currentVersion = versionRegistry.get(candidate.getRequestId());
            if (currentVersion != null && currentVersion == candidate.getVersion()) {
                return candidate;
            }
            // Otherwise this is a stale entry — discard and try next
        }
        return null; // queue empty or all entries stale
    }

    /**
     * Returns the highest-priority entry without removing it.
     * Skips stale entries similarly to extractMin.
     *
     * <p>Time: O(1) for valid top entry
     *
     * @return the minimum entry, or null if queue is empty
     */
    public QueueEntry peek() {
        // Find first non-stale entry from the root
        for (int i = 1; i <= size; i++) {
            QueueEntry candidate = heap[1]; // root
            Integer currentVersion = versionRegistry.get(candidate.getRequestId());
            if (currentVersion != null && currentVersion == candidate.getVersion()) {
                return candidate;
            }
            // Stale root — extract it silently
            extractRaw();
            if (size == 0) break;
        }
        return null;
    }

    /**
     * Updates the priority of an existing request by inserting a new entry
     * with an incremented version. The old entry will be discarded on extraction.
     *
     * <p>Time: O(log n)
     *
     * @param requestId     the request to update
     * @param newPriority   new priority value (1-4)
     * @param registeredAt  original registration time
     */
    public void updatePriority(long requestId, int newPriority, LocalDateTime registeredAt) {
        Integer currentVersion = versionRegistry.get(requestId);
        int newVersion = (currentVersion == null) ? 1 : currentVersion + 1;
        QueueEntry newEntry = new QueueEntry(requestId, newPriority, registeredAt, newVersion);
        insert(newEntry);
    }

    /**
     * Removes a specific request from the queue by invalidating its version.
     * The entry will be discarded on next extraction.
     *
     * <p>Time: O(1)
     *
     * @param requestId the request to invalidate
     */
    public void invalidate(long requestId) {
        versionRegistry.remove(requestId);
    }

    /**
     * Rebuilds the heap from a list of entries.
     * Useful after bulk updates.
     *
     * <p>Time: O(n) using the Floyd heapify algorithm
     *
     * @param entries list of valid entries to populate the heap
     */
    public void rebuild(List<QueueEntry> entries) {
        if (entries == null) {
            throw new IllegalArgumentException("Entries list must not be null");
        }
        size = 0;
        capacity = Math.max(DEFAULT_CAPACITY, entries.size());
        heap = new QueueEntry[capacity + 1];
        versionRegistry.clear();

        // Load all entries
        for (QueueEntry entry : entries) {
            size++;
            heap[size] = entry;
            versionRegistry.put(entry.getRequestId(), entry.getVersion());
        }

        // Floyd's algorithm: heapify all non-leaf nodes from bottom up
        for (int i = size / 2; i >= 1; i--) {
            heapifyDown(i);
        }
    }

    /**
     * Returns the current number of entries (including possibly stale ones).
     *
     * @return number of entries in the array
     */
    public int size() {
        return size;
    }

    /**
     * Returns true if the heap contains no entries.
     *
     * @return true if empty
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns all valid (non-stale) entries as an ordered list.
     * Does not modify the heap.
     *
     * @return list of valid entries in priority order
     */
    public List<QueueEntry> getAllValidEntries() {
        // Build a copy, extract all in order
        PatientPriorityQueue copy = new PatientPriorityQueue(capacity);
        for (int i = 1; i <= size; i++) {
            if (heap[i] != null) {
                Integer cv = versionRegistry.get(heap[i].getRequestId());
                if (cv != null && cv == heap[i].getVersion()) {
                    copy.insert(heap[i]);
                }
            }
        }
        List<QueueEntry> result = new ArrayList<>();
        QueueEntry entry;
        while ((entry = copy.extractMin()) != null) {
            result.add(entry);
        }
        return result;
    }

    // ============================================================
    //  Internal Heap Operations
    // ============================================================

    /**
     * Bubbles element at index i upward to restore the heap property.
     *
     * <p>Time: O(log n)
     *
     * @param i current index of the element to bubble up
     */
    void heapifyUp(int i) {
        while (i > 1) {
            int parent = i / 2;
            if (heap[i].compareTo(heap[parent]) < 0) {
                swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }

    /**
     * Pushes element at index i downward to restore the heap property.
     *
     * <p>Time: O(log n)
     *
     * @param i current index of the element to push down
     */
    void heapifyDown(int i) {
        while (true) {
            int smallest = i;
            int left = 2 * i;
            int right = 2 * i + 1;

            if (left <= size && heap[left].compareTo(heap[smallest]) < 0) {
                smallest = left;
            }
            if (right <= size && heap[right].compareTo(heap[smallest]) < 0) {
                smallest = right;
            }

            if (smallest != i) {
                swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }

    /**
     * Removes and returns the raw root (no version check).
     */
    private QueueEntry extractRaw() {
        if (size == 0) {
            throw new java.util.NoSuchElementException("Priority queue is empty");
        }
        QueueEntry min = heap[1];
        heap[1] = heap[size];
        heap[size] = null;
        size--;
        if (size > 0) {
            heapifyDown(1);
        }
        return min;
    }

    /**
     * Swaps elements at positions i and j in the heap array.
     */
    private void swap(int i, int j) {
        QueueEntry temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }

    /**
     * Doubles the heap capacity when the array is full.
     *
     * <p>Time: O(n)
     */
    private void resize() {
        capacity = capacity * 2;
        QueueEntry[] newHeap = new QueueEntry[capacity + 1];
        System.arraycopy(heap, 0, newHeap, 0, heap.length);
        heap = newHeap;
    }

    // For testing — package-private access to internal array
    QueueEntry[] getHeapArray() {
        return heap;
    }

    int getCapacity() {
        return capacity;
    }
}
