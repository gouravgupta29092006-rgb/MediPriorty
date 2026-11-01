package com.medipriority.dsa.hashmap;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Hash Map — separate chaining collision resolution.
 *
 * <p>Array-backed hash table. Does NOT use Java's HashMap internally.
 * Each bucket is a singly-linked list of {@link Entry} nodes.
 *
 * <p><b>Hash function:</b>
 * {@code index = (key.hashCode() ^ (key.hashCode() >>> 16)) & (capacity - 1)}
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>put:        O(1) average, O(n) worst case</li>
 *   <li>get:        O(1) average, O(n) worst case</li>
 *   <li>remove:     O(1) average, O(n) worst case</li>
 *   <li>resize:     O(n)</li>
 * </ul>
 *
 * <p><b>Space:</b> O(n + capacity)
 *
 * <p>Load factor threshold: 0.75. Capacity doubles on exceed.
 *
 * @param <K> key type (must implement hashCode and equals)
 * @param <V> value type
 *
 * @author MediPriority DSA Module
 */
public class CustomHashMap<K, V> {

    private static final int DEFAULT_CAPACITY = 16;
    private static final double LOAD_FACTOR = 0.75;

    /**
     * Singly-linked list node for each key-value pair in a bucket.
     */
    static class Entry<K, V> {
        K key;
        V value;
        Entry<K, V> next;

        Entry(K key, V value) {
            this.key = key;
            this.value = value;
            this.next = null;
        }
    }

    @SuppressWarnings("unchecked")
    private Entry<K, V>[] buckets;
    private int size;
    private int capacity;

    // ============================================================
    //  Construction
    // ============================================================

    public CustomHashMap() {
        this(DEFAULT_CAPACITY);
    }

    @SuppressWarnings("unchecked")
    public CustomHashMap(int initialCapacity) {
        if (initialCapacity < 1) {
            throw new IllegalArgumentException("Capacity must be at least 1");
        }
        this.capacity = initialCapacity;
        this.buckets = (Entry<K, V>[]) new Entry[capacity];
        this.size = 0;
    }

    // ============================================================
    //  Public Operations
    // ============================================================

    /**
     * Associates the specified value with the specified key.
     * If the key already exists, its value is updated.
     *
     * <p>Time: O(1) average
     *
     * @param key   non-null key
     * @param value value to store
     */
    public void put(K key, V value) {
        if (key == null) {
            throw new IllegalArgumentException("Key must not be null");
        }

        // Resize before inserting if load factor exceeded
        if ((double) size / capacity >= LOAD_FACTOR) {
            resize();
        }

        int index = hash(key);
        Entry<K, V> current = buckets[index];

        // Search for existing key
        while (current != null) {
            if (current.key.equals(key)) {
                current.value = value; // update existing
                return;
            }
            current = current.next;
        }

        // Key not found — prepend new entry to bucket
        Entry<K, V> newEntry = new Entry<>(key, value);
        newEntry.next = buckets[index];
        buckets[index] = newEntry;
        size++;
    }

    /**
     * Returns the value associated with the given key, or null if not found.
     *
     * <p>Time: O(1) average
     *
     * @param key the key to look up
     * @return associated value or null
     */
    public V get(K key) {
        if (key == null) return null;
        int index = hash(key);
        Entry<K, V> current = buckets[index];
        while (current != null) {
            if (current.key.equals(key)) {
                return current.value;
            }
            current = current.next;
        }
        return null;
    }

    /**
     * Removes the mapping for the given key. No-op if key not present.
     *
     * <p>Time: O(1) average
     *
     * @param key the key to remove
     */
    public void remove(K key) {
        if (key == null) return;
        int index = hash(key);
        Entry<K, V> current = buckets[index];
        Entry<K, V> prev = null;

        while (current != null) {
            if (current.key.equals(key)) {
                if (prev == null) {
                    buckets[index] = current.next;
                } else {
                    prev.next = current.next;
                }
                size--;
                return;
            }
            prev = current;
            current = current.next;
        }
    }

    /**
     * Returns true if the map contains a mapping for the given key.
     *
     * <p>Time: O(1) average
     *
     * @param key the key to check
     * @return true if key exists
     */
    public boolean containsKey(K key) {
        return get(key) != null;
    }

    /**
     * Returns the current number of key-value mappings.
     *
     * @return size
     */
    public int size() {
        return size;
    }

    /**
     * Returns true if the map contains no mappings.
     *
     * @return true if empty
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Removes all mappings from the map.
     */
    @SuppressWarnings("unchecked")
    public void clear() {
        buckets = (Entry<K, V>[]) new Entry[capacity];
        size = 0;
    }

    /**
     * Returns all keys currently in the map.
     *
     * @return list of keys
     */
    public List<K> keys() {
        List<K> keys = new ArrayList<>();
        for (Entry<K, V> bucket : buckets) {
            Entry<K, V> current = bucket;
            while (current != null) {
                keys.add(current.key);
                current = current.next;
            }
        }
        return keys;
    }

    /**
     * Returns all values currently in the map.
     *
     * @return list of values
     */
    public List<V> values() {
        List<V> values = new ArrayList<>();
        for (Entry<K, V> bucket : buckets) {
            Entry<K, V> current = bucket;
            while (current != null) {
                values.add(current.value);
                current = current.next;
            }
        }
        return values;
    }

    // ============================================================
    //  Internal Operations
    // ============================================================

    /**
     * Computes the bucket index for a given key.
     * Spreads hash bits to reduce clustering.
     *
     * @param key the key
     * @return bucket index in [0, capacity-1]
     */
    private int hash(K key) {
        int h = key.hashCode();
        // XOR with right-shifted hash to improve distribution
        h = h ^ (h >>> 16);
        return Math.abs(h) % capacity;
    }

    /**
     * Doubles the capacity and rehashes all existing entries.
     *
     * <p>Time: O(n)
     */
    @SuppressWarnings("unchecked")
    private void resize() {
        int newCapacity = capacity * 2;
        Entry<K, V>[] newBuckets = (Entry<K, V>[]) new Entry[newCapacity];
        int oldCapacity = capacity;
        capacity = newCapacity;

        // Rehash all existing entries
        for (int i = 0; i < oldCapacity; i++) {
            Entry<K, V> current = buckets[i];
            while (current != null) {
                Entry<K, V> next = current.next;
                int newIndex = hash(current.key);
                current.next = newBuckets[newIndex];
                newBuckets[newIndex] = current;
                current = next;
            }
        }

        buckets = newBuckets;
    }

    // Package-private for testing
    int getCapacity() {
        return capacity;
    }

    Entry<K, V>[] getBuckets() {
        return buckets;
    }
}
