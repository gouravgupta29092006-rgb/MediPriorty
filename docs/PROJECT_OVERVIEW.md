# PROJECT OVERVIEW — MediPriority

## Problem

Hospital emergency rooms frequently operate on a First Come, First Served (FCFS) model. This creates a dangerous situation where a patient with a minor injury who registers at 10:00 AM receives ambulance and bed resources before a patient in critical condition who registers at 10:03 AM.

The result: preventable deterioration and deaths due to resource misallocation.

## Objectives

1. Replace FCFS with clinical triage-based priority processing.
2. Implement a custom binary min-heap that orders patients by medical urgency.
3. Provide intelligent ambulance dispatch with capability matching and route estimation.
4. Provide intelligent bed allocation with clinical suitability matching.
5. Maintain complete audit trails of all allocation decisions.
6. Demonstrate advanced DSA knowledge through from-scratch implementations.
7. Deliver a functional, maintainable, academically evaluable application.

## Scope

### In Scope

- Single-hospital emergency management system
- Patient registration and emergency request creation
- Clinical triage assessment (RED, ORANGE, YELLOW, GREEN)
- Priority queue management (custom binary min-heap)
- Ambulance inventory management and dispatch workflow
- Hospital bed inventory management and reservation workflow
- Simulated road network with Dijkstra shortest-path routing
- Role-based access (Admin, Dispatcher, Medical Officer)
- Audit logging
- Analytics dashboard
- REST API with OpenAPI documentation
- React frontend dashboard

### Out of Scope (Initial Version)

- Multi-hospital networking
- Real GPS integration
- Autonomous medical diagnosis
- Mobile applications
- Real-time WebSocket notifications (may be added as enhancement)
- Microservices, Docker, Kubernetes
- Payment processing
- EHR/EMR integration

## System Modules

| Module | Description |
|---|---|
| Authentication | Login, JWT/session, role enforcement |
| Patient Management | Registration, records, emergency requests |
| Triage System | Clinical assessment, priority scoring, history |
| Priority Queue Engine | Custom binary min-heap, insertion, extraction, reassessment |
| Ambulance Management | Inventory, status, dispatch workflow |
| Bed Management | Inventory, department, reservation workflow |
| DSA Engine | Heap, HashMap, Graph, Dijkstra, Circular Queue, Merge Sort |
| Road Network | Graph nodes and edges, simulated routing |
| Allocation Engine | Ambulance allocation, bed allocation, locking |
| Analytics | Dashboard statistics, trend charts |
| Audit System | Action logging, history |
| User Management | Admin CRUD for users and roles |

## Expected Outcomes

1. Patients with RED triage are always processed before ORANGE, YELLOW, GREEN.
2. Two dispatchers cannot allocate the same ambulance simultaneously.
3. All clinical assessments are preserved in history.
4. Dashboard reflects live database state.
5. Custom DSA implementations are tested and verified correct.
6. Application can be set up by following INSTALLATION.md in under 30 minutes.
