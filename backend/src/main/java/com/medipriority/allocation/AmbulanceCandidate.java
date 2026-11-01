package com.medipriority.allocation;

import com.medipriority.model.Ambulance;

/**
 * Candidate ambulance for dispatch selection.
 * Carries the pre-computed travel time from Dijkstra.
 */
public class AmbulanceCandidate {

    public final Ambulance ambulance;
    public final double estimatedTravelMinutes;
    public final int capabilityScore; // higher = better match for patient severity

    public AmbulanceCandidate(Ambulance ambulance, double estimatedTravelMinutes,
                               int capabilityScore) {
        this.ambulance = ambulance;
        this.estimatedTravelMinutes = estimatedTravelMinutes;
        this.capabilityScore = capabilityScore;
    }

    @Override
    public String toString() {
        return "AmbulanceCandidate{id=" + ambulance.getAmbulanceId() +
               ", travel=" + estimatedTravelMinutes +
               ", capability=" + capabilityScore + "}";
    }
}
