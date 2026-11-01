package com.medipriority.dsa;

import com.medipriority.dsa.hashmap.CustomHashMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("CustomHashMap — Separate Chaining Hash Map DSA Tests")
class CustomHashMapTest {

    private CustomHashMap<String, Integer> map;

    @BeforeEach
    void setUp() {
        map = new CustomHashMap<>(8);
    }

    @Test
    @DisplayName("Should put and retrieve key-value pairs correctly")
    void testPutAndGet() {
        map.put("RED", 1);
        map.put("ORANGE", 2);
        map.put("YELLOW", 3);
        map.put("GREEN", 4);

        assertEquals(4, map.size());
        assertEquals(1, map.get("RED"));
        assertEquals(2, map.get("ORANGE"));
        assertEquals(3, map.get("YELLOW"));
        assertEquals(4, map.get("GREEN"));
        assertNull(map.get("UNKNOWN"));
    }

    @Test
    @DisplayName("Should update existing value when same key is put again")
    void testOverwriteKey() {
        map.put("REQ-101", 1);
        assertEquals(1, map.get("REQ-101"));

        map.put("REQ-101", 5);
        assertEquals(5, map.get("REQ-101"));
        assertEquals(1, map.size(), "Size should not increase on update");
    }

    @Test
    @DisplayName("Should handle collision with separate chaining correctly")
    void testCollisionHandling() {
        // Two keys with potential collision or forced into small capacity map
        CustomHashMap<Integer, String> smallMap = new CustomHashMap<>(2);
        smallMap.put(1, "one");
        smallMap.put(3, "three");
        smallMap.put(5, "five");
        smallMap.put(7, "seven");

        assertEquals(4, smallMap.size());
        assertEquals("one", smallMap.get(1));
        assertEquals("three", smallMap.get(3));
        assertEquals("five", smallMap.get(5));
        assertEquals("seven", smallMap.get(7));
    }

    @Test
    @DisplayName("Should remove key correctly and return deleted value")
    void testRemove() {
        map.put("keyA", 100);
        map.put("keyB", 200);

        assertTrue(map.containsKey("keyA"));
        map.remove("keyA");
        assertFalse(map.containsKey("keyA"));
        assertNull(map.get("keyA"));
        assertEquals(1, map.size());
        map.remove("nonexistent");
        assertEquals(1, map.size());
    }

    @Test
    @DisplayName("Should automatically resize when load factor 0.75 is exceeded")
    void testDynamicResizing() {
        // Initial capacity is 8, threshold is 6
        for (int i = 0; i < 20; i++) {
            map.put("key" + i, i * 10);
        }

        assertEquals(20, map.size());
        for (int i = 0; i < 20; i++) {
            assertEquals(i * 10, map.get("key" + i));
        }
    }

    @Test
    @DisplayName("Should correctly clear map")
    void testClear() {
        map.put("alpha", 1);
        map.put("beta", 2);
        assertFalse(map.isEmpty());

        map.clear();
        assertTrue(map.isEmpty());
        assertEquals(0, map.size());
        assertNull(map.get("alpha"));
    }
}
