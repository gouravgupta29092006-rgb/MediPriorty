# INSTALLATION — MediPriority

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Java JDK | 21+ | JAVA_HOME must be set |
| Maven | 3.9+ | Or use included mvnw wrapper |
| Node.js | 20+ | LTS recommended |
| npm | 10+ | Included with Node.js |
| MySQL | 8.0+ | Running locally |
| Git | Any | For cloning |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/<your-username>/MediPriority.git
cd MediPriority
```

---

## Step 2: Database Setup

Open MySQL client or MySQL Workbench and execute:

```sql
CREATE DATABASE medipriority_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'medipriority_user'@'localhost'
  IDENTIFIED BY 'YourSecurePassword123!';

GRANT ALL PRIVILEGES ON medipriority_db.*
  TO 'medipriority_user'@'localhost';

FLUSH PRIVILEGES;
```

---

## Step 3: Backend Configuration

Copy the example configuration:

```bash
cd backend/src/main/resources
cp application-example.yml application-local.yml
```

Edit `application-local.yml` and fill in your values:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/medipriority_db?useSSL=false&serverTimezone=UTC
    username: medipriority_user
    password: YourSecurePassword123!

app:
  jwt:
    secret: your-256-bit-secret-key-here-change-this-in-production
    expiration-ms: 86400000
```

---

## Step 4: Run the Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

On Windows:
```powershell
cd backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

On first startup, Flyway will automatically:
1. Create all tables
2. Add indexes
3. Seed initial data (hospital, departments, users, ambulances, beds, road network)

Expected output:
```
Started MediPriorityApplication in X.XXX seconds
```

---

## Step 5: Frontend Setup

```bash
cd frontend
npm install
```

Copy environment config:
```bash
cp .env.example .env.local
```

`.env.local` content (default for local dev):
```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Step 6: Run the Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE ready in XXX ms
  Local:   http://localhost:5173/
```

---

## Step 7: Verify Setup

| Check | URL | Expected |
|---|---|---|
| Frontend | http://localhost:5173 | Login page loads |
| Backend health | http://localhost:8080/api/auth/me | 401 (not authenticated) |
| Swagger UI | http://localhost:8080/swagger-ui.html | API docs page |

---

## Default Login Credentials

| Email | Password | Role |
|---|---|---|
| admin@medipriority.com | Admin@123 | ADMIN |
| dispatcher@medipriority.com | Dispatch@123 | DISPATCHER |
| doctor@medipriority.com | Doctor@123 | MEDICAL_OFFICER |

**Change these passwords immediately in any real deployment.**

---

## Running Tests

Backend unit tests:
```bash
cd backend
./mvnw test
```

Specific test class:
```bash
./mvnw test -Dtest=PatientPriorityQueueTest
```

All DSA tests:
```bash
./mvnw test -Dtest="PatientPriorityQueueTest,CustomHashMapTest,DijkstraAlgorithmTest,CircularQueueTest,MergeSortTest"
```

---

## Troubleshooting

**Port 8080 already in use:**
```yaml
# In application-local.yml
server:
  port: 8081
```

**MySQL connection refused:**
- Verify MySQL service is running
- Check username and password
- Check that the database exists

**Flyway migration failed:**
- Check MySQL user has CREATE, ALTER, DROP privileges
- Check the migration SQL for syntax errors
- Inspect logs: `target/logs/spring.log`

**Frontend cannot reach backend:**
- Verify backend is running on port 8080
- Verify VITE_API_BASE_URL in .env.local
- Check browser console for CORS errors
