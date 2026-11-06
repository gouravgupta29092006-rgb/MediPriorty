# MediPriority — REST API Specification

## 1. Overview & Authentication

- **Base URL:** `http://localhost:8080/api`
- **Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI 3.0 JSON Spec:** `http://localhost:8080/api-docs`
- **Authentication Scheme:** HTTP Bearer Header
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Content-Type:** `application/json`

---

## 2. Authentication Endpoints

### 2.1 Authenticate & Retrieve Token
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@medipriority.com",
    "password": "Admin@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzM4NCJ9...",
    "tokenType": "Bearer",
    "userId": 1,
    "fullName": "System Administrator",
    "email": "admin@medipriority.com",
    "role": "ADMIN"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Field validation failure (e.g. malformed email).
  - `401 Unauthorized`: `"Invalid email or password"`.
  - `403 Forbidden`: `"User account is deactivated. Please contact an administrator."`.

### 2.2 Get Current User Identity
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated (Any role)
- **Response (200 OK):**
  ```json
  {
    "userId": 1,
    "fullName": "System Administrator",
    "email": "admin@medipriority.com",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2026-11-02T04:00:28"
  }
  ```

---

## 3. Operational Dashboard & Priority Queue

### 3.1 Get System Dashboard Metrics
- **Endpoint:** `GET /api/dashboard`
- **Access:** Authenticated (Any role)
- **Response (200 OK):**
  ```json
  {
    "totalActiveRequests": 5,
    "criticalPatients": 2,
    "waitingPatients": 3,
    "availableAmbulances": 6,
    "dispatchedAmbulances": 2,
    "onSceneAmbulances": 1,
    "returningAmbulances": 1,
    "reservedAmbulances": 0,
    "maintenanceAmbulances": 1,
    "availableBeds": 15,
    "occupiedBeds": 5,
    "totalBeds": 20,
    "triageCategoryDistribution": {
      "RED": 2,
      "ORANGE": 1,
      "YELLOW": 1,
      "GREEN": 1
    },
    "bedTypeAvailability": {
      "ICU": 3,
      "EMERGENCY": 5,
      "GENERAL": 7
    },
    "bedTypeOccupied": {
      "ICU": 2,
      "EMERGENCY": 1,
      "GENERAL": 2
    },
    "departmentBeds": [
      {
        "departmentName": "Emergency & Trauma Center",
        "availableBeds": 5,
        "occupiedBeds": 0,
        "totalBeds": 5
      },
      {
        "departmentName": "Intensive Care Unit (ICU)",
        "availableBeds": 3,
        "occupiedBeds": 2,
        "totalBeds": 5
      },
      {
        "departmentName": "Cardiology Care Unit",
        "availableBeds": 3,
        "occupiedBeds": 1,
        "totalBeds": 4
      },
      {
        "departmentName": "General Medicine Ward",
        "availableBeds": 4,
        "occupiedBeds": 2,
        "totalBeds": 6
      }
    ]
  }
  ```

### 3.2 Fetch Priority Queue
- **Endpoint:** `GET /api/priority-queue`
- **Access:** Authenticated (Any role)
- **Description:** Returns the active queue ordered by urgency score via custom Binary Min-Heap.
- **Response (200 OK):**
  ```json
  [
    {
      "queueId": 101,
      "requestId": 14,
      "requestNumber": "REQ-20261102-001",
      "patientName": "Robert Vance",
      "triageCategory": "RED",
      "priorityScore": 1000,
      "waitingTimeMinutes": 4,
      "entryTimestamp": "2026-11-02T12:05:00"
    }
  ]
  ```

---

## 4. Patient Registry Endpoints

### 4.1 Search / List Patients
- **Endpoint:** `GET /api/patients`
- **Parameters:** `query` (optional string), `page` (default 0), `size` (default 20)
- **Access:** Authenticated

### 4.2 Register New Patient
- **Endpoint:** `POST /api/patients`
- **Access:** `DISPATCHER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "fullName": "Jane Doe",
    "dateOfBirth": "1988-06-15",
    "gender": "FEMALE",
    "contactNumber": "+1-555-0144",
    "emergencyContact": "+1-555-0199 (Spouse)"
  }
  ```
- **Response:** `201 Created`

---

## 5. Emergency Requests & Clinical Triage

### 5.1 Create Emergency Request
- **Endpoint:** `POST /api/emergency-requests`
- **Access:** `DISPATCHER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "patientId": 4,
    "pickupNodeId": 4,
    "pickupLocation": "Downtown Plaza, Sector 4",
    "symptomSummary": "Severe acute chest pain radiating to left arm, difficulty breathing",
    "requesterContact": "+1-555-0177"
  }
  ```
- **Response:** `201 Created` with initial status `PENDING_TRIAGE`.

### 5.2 Submit Clinical Triage Assessment
- **Endpoint:** `POST /api/triage`
- **Access:** `MEDICAL_OFFICER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "requestId": 14,
    "category": "RED",
    "vitalSigns": {
      "bloodPressure": "85/55",
      "heartRate": 132,
      "respiratoryRate": 28,
      "oxygenSaturation": 88
    },
    "clinicalNotes": "Acute Coronary Syndrome presentation. Emergent cath lab liaison required."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "triageId": 8,
    "requestId": 14,
    "category": "RED",
    "priorityScore": 1000,
    "triagedAt": "2026-11-02T12:10:00",
    "medicalOfficerName": "Dr. Sarah Connor, MD"
  }
  ```

---

## 6. Resource Allocations (Ambulance & Bed)

### 6.1 Dispatch Optimal Ambulance
- **Endpoint:** `POST /api/allocations/ambulance`
- **Access:** `DISPATCHER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "requestId": 14,
    "requiredEquipmentLevel": "ADVANCED"
  }
  ```
- **Description:** Invokes Dijkstra algorithm to compute the shortest road path from available stations to pickup node.
- **Response (200 OK):**
  ```json
  {
    "allocationId": 22,
    "requestId": 14,
    "ambulanceId": 2,
    "vehicleNumber": "MED-AMB-02",
    "equipmentLevel": "ADVANCED",
    "originStationNodeId": 2,
    "pickupNodeId": 4,
    "estimatedTravelTimeMinutes": 6.2,
    "dispatchedAt": "2026-11-02T12:12:00"
  }
  ```

### 6.2 Reserve Hospital Bed
- **Endpoint:** `POST /api/allocations/bed`
- **Access:** `MEDICAL_OFFICER`, `DISPATCHER`, `ADMIN`
- **Request Body:**
  ```json
  {
    "requestId": 14,
    "bedType": "ICU"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "allocationId": 18,
    "requestId": 14,
    "bedId": 4,
    "bedNumber": "ICU-04",
    "departmentName": "Intensive Care Unit (ICU)",
    "bedType": "ICU",
    "allocatedAt": "2026-11-02T12:15:00"
  }
  ```
- **Conflict Handling (409 Conflict):**
  ```json
  {
    "status": 409,
    "error": "Conflict",
    "message": "Selected bed is no longer available or was concurrently reserved.",
    "timestamp": "2026-11-02T12:15:01"
  }
  ```

---

## 7. Administrative & Audit Endpoints

### 7.1 Manage Users
- **List Users:** `GET /api/users` (Admin only)
- **Toggle User Status:** `PATCH /api/users/{id}/toggle-status` (Admin only)

### 7.2 System Audit Trail
- **Endpoint:** `GET /api/audit-logs`
- **Access:** `ADMIN`
- **Query Parameters:** `page`, `size`, `action` (optional filter)
- **Response (200 OK):** Page array of immutable audit events with actor, timestamp, action type, and details.

