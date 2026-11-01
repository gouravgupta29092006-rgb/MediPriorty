package com.medipriority.dsa.sorting;

import java.util.Comparator;

/**
 * Merge Sort — Generic Recursive Implementation.
 *
 * <p>Used to rank candidate ambulances before selection.
 * Sorting criteria (configured via Comparator):
 * <ol>
 *   <li>Capability match score (higher = better)</li>
 *   <li>Estimated travel time from Dijkstra (lower = better)</li>
 *   <li>Ambulance ID (lower = deterministic tie-break)</li>
 * </ol>
 *
 * <p>Does NOT use Collections.sort() or Arrays.sort() internally.
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>Best:    O(n log n)</li>
 *   <li>Average: O(n log n)</li>
 *   <li>Worst:   O(n log n)</li>
 *   <li>Space:   O(n) auxiliary array</li>
 * </ul>
 *
 * <p><b>Stability:</b> Stable — equal elements preserve original order.
 *
 * @param <T> element type
 *
 * @author MediPriority DSA Module
 */
public class MergeSort<T> {

    /**
     * Sorts the given array in-place using recursive merge sort.
     *
     * @param array      array to sort (modified in-place)
     * @param comparator comparison function
     */
    @SuppressWarnings("unchecked")
    public void sort(T[] array, Comparator<T> comparator) {
        if (array == null) {
            throw new IllegalArgumentException("Array must not be null");
        }
        if (comparator == null) {
            throw new IllegalArgumentException("Comparator must not be null");
        }
        if (array.length <= 1) return;

        T[] auxiliary = (T[]) new Object[array.length];
        mergeSort(array, auxiliary, 0, array.length - 1, comparator);
    }

    // ============================================================
    //  Internal Recursive Operations
    // ============================================================

    /**
     * Recursively splits and merges the array.
     *
     * @param array      source array
     * @param aux        auxiliary array of same size
     * @param left       start index (inclusive)
     * @param right      end index (inclusive)
     * @param comparator comparison function
     */
    private void mergeSort(T[] array, T[] aux, int left, int right,
                            Comparator<T> comparator) {
        if (left >= right) return; // base case: single element

        int mid = left + (right - left) / 2;

        mergeSort(array, aux, left, mid, comparator);
        mergeSort(array, aux, mid + 1, right, comparator);
        merge(array, aux, left, mid, right, comparator);
    }

    /**
     * Merges two sorted sub-arrays [left..mid] and [mid+1..right] into sorted order.
     *
     * @param array  source array
     * @param aux    auxiliary work array
     * @param left   start of left sub-array
     * @param mid    end of left sub-array
     * @param right  end of right sub-array
     * @param comp   comparison function
     */
    private void merge(T[] array, T[] aux, int left, int mid, int right,
                       Comparator<T> comp) {
        // Copy both halves into auxiliary
        for (int k = left; k <= right; k++) {
            aux[k] = array[k];
        }

        int i = left;       // pointer into left half
        int j = mid + 1;    // pointer into right half
        int k = left;       // pointer into merged result

        while (i <= mid && j <= right) {
            // Stable: use <= 0 so equal elements from left half come first
            if (comp.compare(aux[i], aux[j]) <= 0) {
                array[k++] = aux[i++];
            } else {
                array[k++] = aux[j++];
            }
        }

        // Copy remaining elements from left half (right half already in place)
        while (i <= mid) {
            array[k++] = aux[i++];
        }
        // Right half tail is already in the correct position in array
    }
}
