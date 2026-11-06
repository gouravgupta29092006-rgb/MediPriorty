# MediPriority — Academic Walkthrough & Demo Guide

## 1. System Access & Roles

Access the running application at: **[http://localhost:5173](http://localhost:5173)**

On the Command Center Login page, click any of the **Quick Demo Credentials** buttons to instantly populate authorized roles:

| Role | Email | Password | Primary Workflow |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@medipriority.com` | `Admin@123` | System oversight, user accounts, audit logging |
| **Dispatcher** | `dispatcher@medipriority.com` | `Dispatch@123` | Emergency intake, ambulance routing, patient registration |
| **Doctor** | `doctor@medipriority.com` | `Doctor@123` | Clinical triage scoring, hospital bed reservations |

---

## 2. Walkthrough Scenarios for Academic Evaluation

### Scenario A: Emergency Call Intake & Clinical Triage
1. **Login as Dispatcher** (`dispatcher@medipriority.com` / `Dispatch@123`).
2. Navigate to **Emergency Requests** in the left sidebar.
3. Click **"New Emergency Request"**:
   - Select patient: *Robert Vance* (or create a new patient in **Patients Directory**).
   - Pickup Location: *Downtown Center Plaza (Node 4)*.
   - Initial Summary: *Suspected myocardial infarction, severe chest pain*.
   - Click **Submit Request**. Status is created as `PENDING_TRIAGE`.
4. **Switch to Medical Officer** (Logout, then login as `doctor@medipriority.com` / `Doctor@123`).
5. Navigate to **Clinical Triage**:
   - The pending request appears in the evaluation list.
   - Select triage urgency level **RED (Critical)**.
   - Enter vital signs (BP: 85/55, HR: 132, SpO2: 88%) and clinical notes.
   - Click **Submit Triage Assessment**.

### Scenario B: Priority Queue & Heap Inspection
1. Navigate to **Priority Queue** in the navigation sidebar.
2. Observe how the newly triaged RED patient instantly moves to the **top of the queue** ahead of any earlier-arriving GREEN or YELLOW patients.
3. Note the composite Urgency Score (1000) and waiting time calculation, proving the Binary Min-Heap algorithm operates deterministically rather than on FCFS.

### Scenario C: Intelligent Ambulance Dispatch (Dijkstra Routing)
1. **Switch to Dispatcher** (`dispatcher@medipriority.com`).
2. Navigate to **Ambulance Fleet** or the triaged request details in **Emergency Requests**.
3. Click **"Dispatch Optimal Ambulance"**:
   - Required Level: `ADVANCED`.
   - The Dijkstra pathfinding engine evaluates travel times from North EMS Station and South EMS Station to Downtown Plaza.
   - Selects the optimal vehicle with minimal travel time (e.g. 6.2 minutes).
   - Ambulance status immediately transitions to `DISPATCHED`.

### Scenario D: Hospital Bed Reservation & Concurrency Safety
1. **Switch to Medical Officer** (`doctor@medipriority.com`).
2. Navigate to **Hospital Beds**.
3. Filter by department **Intensive Care Unit (ICU)**.
4. Select an available bed and click **"Reserve Bed for Request"**.
5. Bed status transitions to `OCCUPIED`.
6. Attempting to reserve the same bed for another patient simultaneously returns an immediate HTTP 409 Conflict error, proving atomic concurrency safety.

### Scenario E: Governance & Immutable Audit Trail
1. **Login as Administrator** (`admin@medipriority.com`).
2. Navigate to **Audit Logs**:
   - Observe timestamped records of every previous step: login event, triage sign-off, ambulance dispatch, and bed reservation.
3. Navigate to **Emergency Analytics**:
   - Review operational metrics: average triage-to-dispatch turnaround time, triage distribution charts, and bed occupancy rates.

---

## 3. Verification Scenarios for Metric Scoping & UI Polish

### Scenario F: Dashboard Queue Scoping & Alert Integrity
1. **Empty Queue Verification:**
   - When no active emergency cases exist (or after completing/closing all requests), navigate to the **Dashboard**.
   - Verify that **Active Emergencies** displays `0`, **Patient Priority Queue** displays `0`, the critical alert banner is **hidden**, and the **Triage Severity Distribution** reflects `0` for all categories.
2. **Active Incident Verification:**
   - Create and triage an emergency case into **RED**.
   - Observe that the critical alert banner immediately triggers on the Dashboard showing `CRITICAL TRIAGE ALERT: 1 Patient in Category RED`.
   - Priority Queue renders the patient at `#1 (Highest Priority)`.

### Scenario G: Ambulance Route & Travel-Time Estimator
1. Navigate to **Ambulances & Dispatch** (`/ambulances`).
2. Under the **Ambulance Route & Travel-Time Estimator** panel:
   - Select Starting Location: `North EMS Station (Station 2)`.
   - Select Destination: `Hospital Base (Station 1)`.
   - Click **Calculate Route**.
   - Verify the calculated optimal travel time (e.g., 8.5 mins) via Dijkstra pathfinding on the road graph.

### Scenario H: Operational Analytics Verification
1. Navigate to **Analytics & KPIs** (`/analytics`).
2. **Triage Urgency Category Distribution:**
   - Displays real active cases with severity colors (RED, ORANGE, YELLOW, GREEN).
   - If 0 active cases are pending, renders an informative empty-state ("No Active Emergency Triage Cases") without NaN or chart breakage.
3. **Ambulance Fleet Readiness Status:**
   - Renders a clean doughnut chart covering all registered statuses (`Available`, `Dispatched`, `On Scene`, `Returning`, `Reserved`, `Maintenance`).
4. **Bed Availability by Department:**
   - Displays real hospital departments (`Emergency & Trauma Center`, `Intensive Care Unit (ICU)`, `Cardiology Care Unit`, `General Medicine Ward`) with database-backed Available and Occupied bars.
   - Verify that department labels are cleanly angled (`-15°`) and completely visible without clipping.

