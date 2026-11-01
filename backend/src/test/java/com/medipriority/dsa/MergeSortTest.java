package com.medipriority.dsa;

import com.medipriority.dsa.sorting.MergeSort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Comparator;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("MergeSort — Generic Sorting Algorithm Tests")
class MergeSortTest {

    private MergeSort<Integer> intSorter;

    @BeforeEach
    void setUp() {
        intSorter = new MergeSort<>();
    }

    @Test
    @DisplayName("Should correctly sort an array in ascending order")
    void testSortAscending() {
        Integer[] array = {5, 2, 8, 1, 9, 3, 7, 4, 6};
        intSorter.sort(array, Comparator.naturalOrder());

        assertArrayEquals(new Integer[]{1, 2, 3, 4, 5, 6, 7, 8, 9}, array);
    }

    @Test
    @DisplayName("Should handle empty and single-element arrays")
    void testEdgeCases() {
        Integer[] empty = {};
        intSorter.sort(empty, Comparator.naturalOrder());
        assertEquals(0, empty.length);

        Integer[] single = {42};
        intSorter.sort(single, Comparator.naturalOrder());
        assertArrayEquals(new Integer[]{42}, single);
    }

    static class Candidate {
        final String id;
        final int capability;
        final double travelTime;

        Candidate(String id, int capability, double travelTime) {
            this.id = id;
            this.capability = capability;
            this.travelTime = travelTime;
        }
    }

    @Test
    @DisplayName("Should sort candidate ambulances stably by capability (desc) then travelTime (asc)")
    void testCandidateRanking() {
        MergeSort<Candidate> sorter = new MergeSort<>();
        Candidate[] candidates = {
                new Candidate("AMB-1", 2, 10.0),
                new Candidate("AMB-2", 3, 15.0),
                new Candidate("AMB-3", 3, 8.0),
                new Candidate("AMB-4", 1, 3.0)
        };

        sorter.sort(candidates, Comparator
                .comparingInt((Candidate c) -> -c.capability)
                .thenComparingDouble(c -> c.travelTime));

        assertEquals("AMB-3", candidates[0].id, "Highest capability (3) and lowest time (8.0) should be first");
        assertEquals("AMB-2", candidates[1].id, "Capability 3 with higher time should be second");
        assertEquals("AMB-1", candidates[2].id);
        assertEquals("AMB-4", candidates[3].id);
    }
}
