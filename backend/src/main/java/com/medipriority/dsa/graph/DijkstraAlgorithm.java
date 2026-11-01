package com.medipriority.dsa.graph;

import com.medipriority.dsa.hashmap.CustomHashMap;

import java.util.ArrayList;
import java.util.List;

/**
 * Dijkstra's Shortest Path Algorithm.
 *
 * <p>Computes the minimum-weight path between two vertices in a weighted
 * directed graph. Uses the custom binary min-heap for efficient vertex extraction.
 *
 * <p><b>Algorithm:</b>
 * <pre>
 * 1. Initialize dist[] = INFINITY for all vertices; dist[source] = 0
 * 2. Insert (0, source) into custom min-heap
 * 3. While heap not empty:
 *    a. Extract (d, u) with minimum distance
 *    b. If d > dist[u]: skip (stale heap entry)
 *    c. For each neighbor v of u with edge weight w:
 *       - If dist[u] + w &lt; dist[v]:
 *         - dist[v] = dist[u] + w
 *         - pred[v] = u
 *         - Insert (dist[v], v) into heap
 * 4. Reconstruct path using pred[] array
 * </pre>
 *
 * <p><b>Complexity:</b> O((V + E) log V) with binary heap
 *
 * <p><b>Space:</b> O(V) for dist[] and pred[]
 *
 * <p>Does NOT use Java's PriorityQueue internally.
 *
 * @author MediPriority DSA Module
 */
public class DijkstraAlgorithm {

    /**
     * A vertex-distance pair used as the heap entry for Dijkstra.
     */
    private static class VertexEntry implements Comparable<VertexEntry> {
        final long vertexId;
        final double distance;

        VertexEntry(long vertexId, double distance) {
            this.vertexId = vertexId;
            this.distance = distance;
        }

        @Override
        public int compareTo(VertexEntry other) {
            return Double.compare(this.distance, other.distance);
        }
    }

    /**
     * Minimal binary min-heap for VertexEntry objects.
     * Separate from PatientPriorityQueue to avoid type coupling.
     */
    private static class VertexMinHeap {
        private VertexEntry[] heap;
        private int size;
        private int capacity;

        VertexMinHeap(int capacity) {
            this.capacity = capacity;
            this.heap = new VertexEntry[capacity + 1];
            this.size = 0;
        }

        void insert(VertexEntry entry) {
            if (size >= capacity) {
                capacity *= 2;
                VertexEntry[] newHeap = new VertexEntry[capacity + 1];
                System.arraycopy(heap, 0, newHeap, 0, heap.length);
                heap = newHeap;
            }
            size++;
            heap[size] = entry;
            heapifyUp(size);
        }

        VertexEntry extractMin() {
            if (size == 0) throw new java.util.NoSuchElementException();
            VertexEntry min = heap[1];
            heap[1] = heap[size];
            heap[size] = null;
            size--;
            if (size > 0) heapifyDown(1);
            return min;
        }

        boolean isEmpty() { return size == 0; }

        private void heapifyUp(int i) {
            while (i > 1 && heap[i].compareTo(heap[i / 2]) < 0) {
                swap(i, i / 2);
                i /= 2;
            }
        }

        private void heapifyDown(int i) {
            while (true) {
                int smallest = i;
                int l = 2 * i, r = 2 * i + 1;
                if (l <= size && heap[l].compareTo(heap[smallest]) < 0) smallest = l;
                if (r <= size && heap[r].compareTo(heap[smallest]) < 0) smallest = r;
                if (smallest != i) { swap(i, smallest); i = smallest; }
                else break;
            }
        }

        private void swap(int i, int j) {
            VertexEntry t = heap[i]; heap[i] = heap[j]; heap[j] = t;
        }
    }

    // ============================================================
    //  Public API
    // ============================================================

    /**
     * Computes the shortest path from source to destination in the given graph.
     *
     * @param graph       the road network graph
     * @param sourceId    starting vertex (ambulance location)
     * @param destId      destination vertex (patient pickup node)
     * @return ShortestPathResult containing distance and path, or unreachable result
     * @throws IllegalArgumentException if source or destination not in graph
     */
    public ShortestPathResult findShortestPath(HospitalGraph graph, long sourceId, long destId) {
        if (!graph.hasVertex(sourceId)) {
            throw new IllegalArgumentException("Source vertex not found: " + sourceId);
        }
        if (!graph.hasVertex(destId)) {
            throw new IllegalArgumentException("Destination vertex not found: " + destId);
        }

        List<Long> vertices = graph.getAllVertices();
        int n = vertices.size();

        // Map vertex IDs to indices for array access
        CustomHashMap<Long, Integer> indexMap = new CustomHashMap<>();
        for (int i = 0; i < vertices.size(); i++) {
            indexMap.put(vertices.get(i), i);
        }

        double[] dist = new double[n];
        long[] pred = new long[n];
        for (int i = 0; i < n; i++) {
            dist[i] = Double.POSITIVE_INFINITY;
            pred[i] = -1L;
        }

        int srcIndex = indexMap.get(sourceId);
        dist[srcIndex] = 0.0;

        VertexMinHeap minHeap = new VertexMinHeap(n);
        minHeap.insert(new VertexEntry(sourceId, 0.0));

        while (!minHeap.isEmpty()) {
            VertexEntry current = minHeap.extractMin();
            long u = current.vertexId;
            Integer uIdx = indexMap.get(u);
            if (uIdx == null) continue;

            // Stale entry check
            if (current.distance > dist[uIdx]) continue;

            // Relaxation
            for (HospitalGraph.GraphEdge edge : graph.getNeighbors(u)) {
                long v = edge.destination;
                Integer vIdx = indexMap.get(v);
                if (vIdx == null) continue;

                double newDist = dist[uIdx] + edge.weight;
                if (newDist < dist[vIdx]) {
                    dist[vIdx] = newDist;
                    pred[vIdx] = u;
                    minHeap.insert(new VertexEntry(v, newDist));
                }
            }
        }

        // Check reachability
        int destIndex = indexMap.get(destId);
        if (dist[destIndex] == Double.POSITIVE_INFINITY) {
            return ShortestPathResult.unreachable(sourceId, destId);
        }

        // Reconstruct path
        List<Long> path = reconstructPath(pred, indexMap, vertices, sourceId, destId);
        return ShortestPathResult.reachable(sourceId, destId, dist[destIndex], path);
    }

    /**
     * Reconstructs the path from source to destination using predecessor array.
     */
    private List<Long> reconstructPath(long[] pred,
                                        CustomHashMap<Long, Integer> indexMap,
                                        List<Long> vertices,
                                        long sourceId, long destId) {
        List<Long> path = new ArrayList<>();
        long current = destId;

        while (current != -1L) {
            path.add(0, current); // prepend
            if (current == sourceId) break;
            Integer idx = indexMap.get(current);
            if (idx == null) break;
            current = pred[idx];
        }

        return path;
    }
}
