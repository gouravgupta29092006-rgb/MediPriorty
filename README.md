# 🏥 MediPriority — Intelligent Hospital Emergency Ambulance & Bed Allocation System

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.x-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## Problem Statement

Traditional hospital emergency systems operate on a First Come, First Served (FCFS) basis. This is clinically dangerous — a patient with a minor injury who arrives early may receive attention before a patient in critical condition who arrives minutes later.

**MediPriority** solves this by implementing a clinical triage-based priority system that ensures patients with greater medical urgency are always processed first, regardless of arrival order.

---

## Project Objective

- Allocate ambulances based on clinical urgency and estimated response time
- Allocate hospital beds based on patient requirements and bed suitability
- Implement custom DSA from scratch
- Maintain complete allocation history and audit trails
- Prevent duplicate resource allocation through database-level locking

---

## Key Features

| Feature | Description |
|---|---|
| Priority Queue | Custom binary min-heap ordering patients by clinical urgency |
| Ambulance Dispatch | Capability-matched allocation with Dijkstra shortest path |
| Bed Allocation | Suitability-checked bed reservation with pessimistic locking |
| Triage Management | Multi-version clinical assessment with full history |
| Role-Based Access | Admin, Dispatcher, and Medical Officer roles |
| Audit Logging | Complete trail of all system actions |
| Real-time Dashboard | Live statistics from actual database queries |
| Analytics | Historical trends with Recharts visualizations |

---

## Custom DSA Implementations

| Structure | File | Use Case | Complexity |
|---|---|---|---|
| Binary Min-Heap | PatientPriorityQueue.java | Patient priority ordering | O(log n) insert/extract |
| Custom HashMap | CustomHashMap.java | Fast resource lookups | O(1) average |
| Graph (Adj. List) | HospitalGraph.java | Road network model | O(V+E) traversal |
| Dijkstra Algorithm | DijkstraAlgorithm.java | Shortest ambulance route | O((V+E) log V) |
| Circular Queue | CircularQueue.java | Event dispatch buffer | O(1) enqueue/dequeue |
| Merge Sort | MergeSort.java | Ambulance ranking | O(n log n) |

---

## Technology Stack

Backend: Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA, Hibernate ORM, Flyway, Maven
Frontend: React 18, TypeScript 5, Vite, Tailwind CSS, React Router, Axios, TanStack Query, Recharts, Lucide React
Database: MySQL 8.0, InnoDB, utf8mb4, Pessimistic Locking
Testing: JUnit 5, Mockito, Spring Boot Test, MockMvc

---

## Architecture Overview

```
React Frontend  ->  REST API  ->  Spring Boot Backend
                                        |
                                Spring Security
                                        |
                                Controller Layer
                                        |
                                Service Layer
                                    /       \
                      Custom DSA Engine    Repository Layer
                                                |
                                            MySQL 8
```

---

## Project Structure

```
MediPriority/
|-- backend/                    Spring Boot application
|-- frontend/                   React/Vite application
|-- docs/                       All project documentation
```

---

## Quick Start

Prerequisites: Java 21+, Node.js 20+, MySQL 8.0+, Maven 3.9+

1. Clone: git clone https://github.com/<your-username>/MediPriority.git
2. Setup MySQL database (see docs/DATABASE_SETUP.md)
3. Configure backend (copy application-example.yml to application-local.yml)
4. Run backend: cd backend && mvn spring-boot:run
5. Run frontend: cd frontend && npm install && npm run dev
6. Access: http://localhost:5173 (frontend), http://localhost:8080/api (API)

---

## Default Users (Seeded)

| Email | Password | Role |
|---|---|---|
| admin@medipriority.com | Admin@123 | ADMIN |
| dispatcher@medipriority.com | Dispatch@123 | DISPATCHER |
| doctor@medipriority.com | Doctor@123 | MEDICAL_OFFICER |

Change all default passwords after first login.

---

## Documentation

Full documentation in docs/ directory.

- ARCHITECTURE.md - System design
- DATABASE_SCHEMA.md - Tables, columns, indexes
- DSA_IMPLEMENTATION.md - Custom data structures
- API_DOCUMENTATION.md - REST endpoint reference
- DEVELOPMENT_STATUS.md - Current build status
- INSTALLATION.md - Full setup guide

---

## Running Tests

```bash
cd backend && mvn test
```

---

## Security

BCrypt password hashing, role-based API protection, pessimistic locking for resource allocation, input validation on all endpoints. See docs/SECURITY.md.

---

*MediPriority - Saving lives through intelligent resource allocation*
