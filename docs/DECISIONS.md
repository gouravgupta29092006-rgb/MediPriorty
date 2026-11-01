# DECISIONS — MediPriority

Architectural and design decisions with reasoning.

---

## D-001: Monolithic Architecture

**Decision:** Use a modular layered monolith rather than microservices.

**Reason:**
- System scope is a single hospital — no need for distributed services.
- Simplifies local development setup (no Docker Compose required).
- Easier to evaluate academically.
- Avoids complexity: service discovery, inter-service auth, distributed transactions.
- Can be decomposed into microservices in a future version if needed.

---

## D-002: MySQL as Source of Truth for Resource Availability

**Decision:** Always revalidate resource availability in MySQL before committing an allocation, even after the DSA engine has identified a candidate.

**Reason:**
- The priority queue and Merge Sort ranking run in memory.
- If two dispatchers operate simultaneously, both may identify the same ambulance as "best."
- Only a database-level pessimistic lock (SELECT FOR UPDATE) guarantees exclusive access.
- This prevents double allocation.

---

## D-003: Array-Backed DSA Implementations

**Decision:** Implement all custom DSA using arrays (not Java LinkedList, Java PriorityQueue, etc.).

**Reason:**
- Academic requirement: demonstrate from-scratch implementation.
- Array-backed heap has better cache performance than pointer-based trees.
- Avoids hiding implementation details behind library abstractions.

---

## D-004: Versioned Queue Entries for Reassessment

**Decision:** Use a version counter rather than heap-decrease-key for priority updates.

**Reason:**
- Heap-decrease-key requires either a position map or a full scan.
- Versioning is simpler: insert new entry, mark old version as invalid.
- On extraction, stale entries (old version) are discarded.
- Correct and thread-safe with appropriate synchronization in the service layer.

---

## D-005: JWT Authentication

**Decision:** Use stateless JWT tokens rather than server-side sessions.

**Reason:**
- REST APIs are by nature stateless; JWT fits naturally.
- No server-side session storage needed.
- Simpler horizontal scaling if the system grows.
- Spring Security has first-class JWT support via SecurityFilterChain.

---

## D-006: Flyway for Database Migrations

**Decision:** Use Flyway for all schema changes rather than `spring.jpa.hibernate.ddl-auto=create`.

**Reason:**
- DDL auto-create destroys data on restart.
- Flyway provides versioned, auditable, repeatable schema migrations.
- SQL migrations are readable and reviewable without Java knowledge.
- Required for production-quality applications.

---

## D-007: Tailwind CSS for Frontend

**Decision:** Use Tailwind CSS rather than a component library (MUI, Chakra, Ant Design).

**Reason:**
- Full control over design without fighting component library styles.
- Results in a more distinctive, premium look.
- Smaller bundle (purged CSS).
- Per specification: Tailwind CSS is explicitly required.

---

## D-008: No Real GPS Integration

**Decision:** Use simulated road network (database graph) rather than a real mapping API.

**Reason:**
- Real GPS APIs (Google Maps, Mapbox) require paid credentials.
- System specification explicitly requires simulated location data.
- The Dijkstra algorithm still demonstrates correct shortest-path computation.
- Road network data is seeded in MySQL via Flyway.

---

## D-009: Separate Ambulance and Bed Allocation Workflows

**Decision:** Ambulance dispatch and bed reservation are independent processes with independent statuses.

**Reason:**
- A patient may need an ambulance before a bed is confirmed.
- A bed shortage must not delay ambulance dispatch.
- Each has its own allocation history table.
- Independent workflows allow parallel operation by different staff.

---

## D-010: Triage Records Are Immutable

**Decision:** Never update or delete a triage_record row. Each reassessment creates a new row.

**Reason:**
- Clinical-legal requirement: all assessments must be preserved.
- Enables full audit trail of clinical decisions.
- Supports accountability if a priority decision is later questioned.
- Versioning field identifies the most recent assessment.
