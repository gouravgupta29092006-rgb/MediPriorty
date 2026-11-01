package com.medipriority.dsa;

import com.medipriority.dsa.queue.CircularQueue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("CircularQueue — Ring Buffer DSA Tests")
class CircularQueueTest {

    private CircularQueue<String> queue;

    @BeforeEach
    void setUp() {
        queue = new CircularQueue<>(4);
    }

    @Test
    @DisplayName("Should enqueue and dequeue in FIFO order")
    void testFifoOrder() {
        queue.enqueue("Event-1");
        queue.enqueue("Event-2");
        queue.enqueue("Event-3");

        assertEquals(3, queue.size());
        assertEquals("Event-1", queue.peek());
        assertEquals("Event-1", queue.dequeue());
        assertEquals("Event-2", queue.dequeue());
        assertEquals("Event-3", queue.dequeue());
        assertTrue(queue.isEmpty());
    }

    @Test
    @DisplayName("Should wrap around correctly in circular buffer")
    void testWrapAround() {
        // Enqueue 3 elements
        queue.enqueue("A");
        queue.enqueue("B");
        queue.enqueue("C");

        // Dequeue 2 elements -> head moves forward
        assertEquals("A", queue.dequeue());
        assertEquals("B", queue.dequeue());

        // Enqueue 2 more -> wraps around buffer boundary
        queue.enqueue("D");
        queue.enqueue("E");

        assertEquals(3, queue.size());
        assertEquals("C", queue.dequeue());
        assertEquals("D", queue.dequeue());
        assertEquals("E", queue.dequeue());
        assertTrue(queue.isEmpty());
    }

    @Test
    @DisplayName("Should automatically resize when full")
    void testResizeWhenFull() {
        // Initial capacity is 4
        for (int i = 1; i <= 10; i++) {
            queue.enqueue("Item-" + i);
        }

        assertEquals(10, queue.size());
        for (int i = 1; i <= 10; i++) {
            assertEquals("Item-" + i, queue.dequeue());
        }
        assertTrue(queue.isEmpty());
    }

    @Test
    @DisplayName("Should throw NoSuchElementException on dequeue from empty queue")
    void testEmptyDequeueThrows() {
        assertTrue(queue.isEmpty());
        assertThrows(NoSuchElementException.class, () -> queue.dequeue());
        assertThrows(NoSuchElementException.class, () -> queue.peek());
    }
}
