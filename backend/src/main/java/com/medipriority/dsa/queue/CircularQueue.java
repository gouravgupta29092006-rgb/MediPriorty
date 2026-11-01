package com.medipriority.dsa.queue;

/**
 * Circular Queue (Ring Buffer) — generic FIFO queue.
 *
 * <p>Array-backed circular queue using head and tail pointers.
 * Used for buffering dispatch and allocation events in order.
 *
 * <p><b>Complexity:</b>
 * <ul>
 *   <li>enqueue:  O(1) amortized</li>
 *   <li>dequeue:  O(1)</li>
 *   <li>peek:     O(1)</li>
 *   <li>size:     O(1)</li>
 * </ul>
 *
 * <p><b>Space:</b> O(capacity)
 *
 * <p>When the queue is full, capacity doubles and elements are recopied.
 *
 * @param <T> element type
 *
 * @author MediPriority DSA Module
 */
public class CircularQueue<T> {

    private static final int DEFAULT_CAPACITY = 16;

    private Object[] elements;
    private int head;   // index of the front element
    private int tail;   // index of the next insertion point
    private int size;
    private int capacity;

    // ============================================================
    //  Construction
    // ============================================================

    public CircularQueue() {
        this(DEFAULT_CAPACITY);
    }

    public CircularQueue(int initialCapacity) {
        if (initialCapacity < 1) {
            throw new IllegalArgumentException("Capacity must be at least 1");
        }
        this.capacity = initialCapacity;
        this.elements = new Object[capacity];
        this.head = 0;
        this.tail = 0;
        this.size = 0;
    }

    // ============================================================
    //  Public Operations
    // ============================================================

    /**
     * Adds an element to the back of the queue.
     * Resizes if the queue is full.
     *
     * <p>Time: O(1) amortized
     *
     * @param item element to enqueue
     */
    public void enqueue(T item) {
        if (item == null) {
            throw new IllegalArgumentException("Null elements are not allowed");
        }
        if (isFull()) {
            resize();
        }
        elements[tail] = item;
        tail = (tail + 1) % capacity;
        size++;
    }

    /**
     * Removes and returns the front element.
     *
     * <p>Time: O(1)
     *
     * @return the front element
     * @throws java.util.NoSuchElementException if the queue is empty
     */
    @SuppressWarnings("unchecked")
    public T dequeue() {
        if (isEmpty()) {
            throw new java.util.NoSuchElementException("Queue is empty");
        }
        T item = (T) elements[head];
        elements[head] = null; // help GC
        head = (head + 1) % capacity;
        size--;
        return item;
    }

    /**
     * Returns the front element without removing it.
     *
     * <p>Time: O(1)
     *
     * @return the front element
     * @throws java.util.NoSuchElementException if the queue is empty
     */
    @SuppressWarnings("unchecked")
    public T peek() {
        if (isEmpty()) {
            throw new java.util.NoSuchElementException("Queue is empty");
        }
        return (T) elements[head];
    }

    /**
     * Returns true if the queue has no elements.
     *
     * @return true if empty
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * Returns true if the queue is at capacity.
     * After a call to isFull(), the next enqueue will trigger resize.
     *
     * @return true if full
     */
    public boolean isFull() {
        return size == capacity;
    }

    /**
     * Returns the number of elements currently in the queue.
     *
     * @return current size
     */
    public int size() {
        return size;
    }

    /**
     * Returns the current maximum capacity.
     *
     * @return capacity
     */
    public int capacity() {
        return capacity;
    }

    // ============================================================
    //  Internal Operations
    // ============================================================

    /**
     * Doubles the capacity and recopies elements in order.
     *
     * <p>Time: O(n)
     */
    private void resize() {
        int newCapacity = capacity * 2;
        Object[] newElements = new Object[newCapacity];

        // Recopy elements maintaining order from head to tail
        for (int i = 0; i < size; i++) {
            newElements[i] = elements[(head + i) % capacity];
        }

        elements = newElements;
        head = 0;
        tail = size;
        capacity = newCapacity;
    }

    @Override
    public String toString() {
        if (isEmpty()) return "CircularQueue[]";
        StringBuilder sb = new StringBuilder("CircularQueue[");
        for (int i = 0; i < size; i++) {
            sb.append(elements[(head + i) % capacity]);
            if (i < size - 1) sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }
}
