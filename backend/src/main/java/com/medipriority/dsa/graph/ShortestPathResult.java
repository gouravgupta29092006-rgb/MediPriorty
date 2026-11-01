package com.medipriority.dsa.graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Result of a Dijkstra shortest-path computation.
 */
public class ShortestPathResult {

    private final long source;
    private final long destination;
    private final double totalWeight;     // total travel time in minutes
    private final List<Long> path;        // ordered list of node IDs from source to destination
    private final boolean reachable;

    private ShortestPathResult(long source, long destination,
                               double totalWeight, List<Long> path, boolean reachable) {
        this.source = source;
        this.destination = destination;
        this.totalWeight = totalWeight;
        this.path = path;
        this.reachable = reachable;
    }

    public static ShortestPathResult reachable(long source, long destination,
                                               double totalWeight, List<Long> path) {
        return new ShortestPathResult(source, destination, totalWeight, path, true);
    }

    public static ShortestPathResult unreachable(long source, long destination) {
        return new ShortestPathResult(source, destination, Double.POSITIVE_INFINITY,
                Collections.emptyList(), false);
    }

    public long getSource()       { return source; }
    public long getDestination()  { return destination; }
    public double getTotalWeight(){ return totalWeight; }
    public List<Long> getPath()   { return path; }
    public boolean isReachable()  { return reachable; }

    @Override
    public String toString() {
        return "ShortestPathResult{source=" + source + ", dest=" + destination +
               ", weight=" + totalWeight + ", reachable=" + reachable + "}";
    }
}
