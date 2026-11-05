# MediPriority — Environment Setup Guide

## 1. Prerequisites

Before setting up MediPriority on your local machine, ensure the following software packages are installed:

| Component | Minimum Version | Recommended Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Java JDK** | 21 LTS | Eclipse Adoptium OpenJDK 21 | `java -version` |
| **Node.js** | 18.x LTS | 20.x or 22.x LTS | `node -v` |
| **npm** | 9.x | 10.x | `npm -v` |
| **MySQL Server** | 8.0+ | MySQL Community Server 8.0 or 9.x | `mysql --version` |
| **Git** | 2.30+ | 2.40+ | `git --version` |
| **Maven** | *(Bundled)* | Apache Maven 3.9+ via `mvnw` | `.\mvnw.cmd -v` |

---

## 2. Windows Development Setup

### 2.1 JAVA_HOME & PATH Configuration
1. Install JDK 21 to standard directory: `C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot`.
2. Open Windows Environment Variables:
   - Variable: `JAVA_HOME` $\rightarrow$ Value: `C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot`
   - Edit System Variable `Path` $\rightarrow$ Add `%JAVA_HOME%\bin`.
3. Verify in PowerShell:
   ```powershell
   java -version
   # Expected: openjdk version "21.0.x"
   ```

### 2.2 Node.js & npm Setup
1. Download and install Node.js LTS from [nodejs.org](https://nodejs.org/).
2. Verify in PowerShell:
   ```powershell
   node -v
   npm -v
   ```

### 2.3 MySQL Service Verification
1. Ensure the MySQL Windows service is running:
   ```powershell
   Get-Service -Name MySQL*, mysql*
   ```
2. If stopped, start the service:
   ```powershell
   Start-Service -Name MySQL80   # Or your installed service name, e.g., MySQL97
   ```

---

## 3. Environment Variables Reference

Configuration values can be customized via environment variables without altering source code:

| Variable | Description | Default Development Value |
| :--- | :--- | :--- |
| `DB_URL` | JDBC database connection string | `jdbc:mysql://localhost:3306/medipriority_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | MySQL database user | `medipriority_user` |
| `DB_PASSWORD` | MySQL database user password | `changeme` |
| `JWT_SECRET` | 256-bit cryptographic signing secret | `default-dev-secret-change-in-production-must-be-256-bits` |
| `JWT_EXPIRATION_MS` | JWT validity duration in milliseconds | `86400000` (24 hours) |
| `SERVER_PORT` | Backend Tomcat HTTP listen port | `8080` |
| `CORS_ALLOWED_ORIGIN` | Allowed client origin for CORS headers | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Frontend API client base URL | `http://localhost:8080/api` |

