package com.medipriority.dsa.graph;

import java.util.ArrayList;
import java.util.List;

/**
 * Weighted directed graph using adjacency lists.
 *
 * <p>Represents the hospital road network.
 * Vertices are road node IDs (Long). Edges are weighted by travel time (double).
 * Bidirectional edges in the database are stored as two directed edges.
 *
 * <p>Does NOT use Java's LinkedList internally.
 * Adjacency lists are stored as resizable arrays ({@link ArrayList}).
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>addVertex:      O(1)</li>
 *   <li>addEdge:        O(1) amortized</li>
 *   <li>getNeighbors:   O(1)</li>
 *   <li>Space:          O(V + E)</li>
 * </ul>
 *
 * @author MediPriority DSA Module
 */
public class HospitalGraph {

    /**
     * A directed weighted edge in the graph.
     */
    public static class GraphEdge {
        public final long destination;
        public final double weight; // travel_time_minutes

        public GraphEdge(long destination, double weight) {
            this.destination = destination;
            this.weight = weight;
        }

        @Override
        public String toString() {
            return "Edge{to=" + destination + ", weight=" + weight + "}";
        }
    }

    // vertex ID -> list of outgoing edges
    // Uses CustomHashMap to avoid Java HashMap
    private final com.medipriority.dsa.hashmap.CustomHashMap<Long, List<GraphEdge>> adjacencyList;
    private int vertexCount;
    private int edgeCount;

    public HospitalGraph() {
        this.adjacencyList = new com.medipriority.dsa.hashmap.CustomHashMap<>();
        this.vertexCount = 0;
        this.edgeCount = 0;
    }

    // ============================================================
    //  Public Operations
    // ============================================================

    /**
     * Adds a vertex (road node) to the graph.
     * No-op if vertex already exists.
     *
     * <p>Time: O(1)
     *
     * @param nodeId the vertex identifier
     */
    public void addVertex(long nodeId) {
        if (!adjacencyList.containsKey(nodeId)) {
            adjacencyList.put(nodeId, new ArrayList<>());
            vertexCount++;
        }
    }

    /**
     * Adds a directed weighted edge from source to destination.
     * Both vertices must already be added to the graph.
     *
     * <p>Time: O(1) amortized
     *
     * @param sourceId      source vertex
     * @param destinationId destination vertex
     * @param weight        edge weight (travel time in minutes)
     * @throws IllegalArgumentException if either vertex does not exist
     */
    public void addEdge(long sourceId, long destinationId, double weight) {
        if (!adjacencyList.containsKey(sourceId)) {
            throw new IllegalArgumentException("Source vertex not found: " + sourceId);
        }
        if (!adjacencyList.containsKey(destinationId)) {
            throw new IllegalArgumentException("Destination vertex not found: " + destinationId);
        }
        adjacencyList.get(sourceId).add(new GraphEdge(destinationId, weight));
        edgeCount++;
    }

    /**
     * Adds an undirected (bidirectional) edge between two vertices.
     * Creates two directed edges internally.
     *
     * <p>Time: O(1) amortized
     *
     * @param nodeA  first vertex
     * @param nodeB  second vertex
     * @param weight edge weight (symmetric travel time)
     */
    public void addUndirectedEdge(long nodeA, long nodeB, double weight) {
        addEdge(nodeA, nodeB, weight);
        addEdge(nodeB, nodeA, weight);
    }

    /**
     * Returns all outgoing edges from the given vertex.
     *
     * <p>Time: O(1)
     *
     * @param nodeId vertex to query
     * @return list of outgoing edges; empty list if vertex has no edges
     * @throws IllegalArgumentException if vertex does not exist
     */
    public List<GraphEdge> getNeighbors(long nodeId) {
        List<GraphEdge> edges = adjacencyList.get(nodeId);
        if (edges == null) {
            throw new IllegalArgumentException("Vertex not found: " + nodeId);
        }
        return edges;
    }

    /**
     * Returns true if the given vertex exists in the graph.
     *
     * @param nodeId vertex to check
     * @return true if vertex exists
     */
    public boolean hasVertex(long nodeId) {
        return adjacencyList.containsKey(nodeId);
    }

    /**
     * Returns the total number of vertices.
     *
     * @return vertex count
     */
    public int getVertexCount() {
        return vertexCount;
    }

    /**
     * Returns the total number of directed edges.
     *
     * @return edge count
     */
    public int getEdgeCount() {
        return edgeCount;
    }

    /**
     * Returns all vertex IDs in the graph.
     *
     * @return list of all vertex IDs
     */
    public List<Long> getAllVertices() {
        return adjacencyList.keys();
    }

    /**
     * Clears all vertices and edges.
     */
    public void clear() {
        adjacencyList.clear();
        vertexCount = 0;
        edgeCount = 0;
    }

    @Override
    public String toString() {
        return "HospitalGraph{vertices=" + vertexCount + ", edges=" + edgeCount + "}";
    }
}
