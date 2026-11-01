# BUG TRACKER — MediPriority

## Open Bugs

None. All discovered bugs have been resolved and verified by automated unit tests.

---

## Resolved Bugs

### BUG-001: JDK 25 Compiler Incompatibility with Lombok 1.18.34
- **Date Found:** 2026-11-01
- **Severity:** CRITICAL
- **Description:** `mvn compile` threw `Fatal error compiling: java.lang.ExceptionInInitializerError: com.sun.tools.javac.code.TypeTag :: UNKNOWN`.
- **Root Cause:** Environment defaulted to JDK 25.0.1. Javac in JDK 25 altered internal `TypeTag` definitions that broke Lombok's annotation processor.
- **Resolution:** Installed Eclipse Temurin JDK 21.0.13 LTS via winget and configured `backend/mvnw.cmd` with `JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"`. Also configured `annotationProcessorPaths` in `maven-compiler-plugin`.
- **Status:** RESOLVED

### BUG-002: Missing SecurityUtil Helper Class
- **Date Found:** 2026-11-01
- **Severity:** HIGH
- **Description:** `PatientController.java` referenced `com.medipriority.util.SecurityUtil` which had not been created.
- **Root Cause:** Incomplete recovery from prior session.
- **Resolution:** Implemented `SecurityUtil.java` with static methods for extracting `getCurrentUserId()`, `getCurrentUserEmail()`, and `getCurrentUserRole()` from Spring `SecurityContextHolder`.
- **Status:** RESOLVED

### BUG-003: Allocation Endpoints Role Restriction on Bed Management
- **Date Found:** 2026-11-01
- **Severity:** MEDIUM
- **Description:** In `SecurityConfig.java`, `/api/allocations/**` only permitted `DISPATCHER` and `ADMIN`, denying `MEDICAL_OFFICER` access to bed allocations.
- **Root Cause:** Overly restrictive rule mapping.
- **Resolution:** Updated `SecurityConfig.java` to grant `hasAnyRole("DISPATCHER", "MEDICAL_OFFICER", "ADMIN")` on `/api/allocations/**`.
- **Status:** RESOLVED

### BUG-004: PatientPriorityQueueTest Lazy Eviction Assertion
- **Date Found:** 2026-11-01
- **Severity:** LOW
- **Description:** `PatientPriorityQueueTest.testReassessmentVersioning` asserted `isEmpty()` before extracting the stale version node.
- **Root Cause:** Reassessment creates a new entry with an incremented version; stale entries are lazily discarded during traversal/extraction.
- **Resolution:** Adjusted test assertion to extract until `null` is returned, verifying lazy eviction of stale entries.
- **Status:** RESOLVED

### BUG-005: Jackson HttpMessageConversionException on Hibernate Lazy Proxy (AuditLog)
- **Date Found:** 2026-11-01
- **Severity:** MEDIUM
- **Description:** `GET /api/audit-logs` resulted in HTTP 500 error: `HttpMessageConversionException: Type definition error: [simple type, class org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor]`.
- **Root Cause:** `AuditLog.user` is a lazy-loaded Hibernate proxy. Jackson ObjectMapper attempted to serialize internal ByteBuddy proxy interception fields and unmasked passwordHash.
- **Resolution:** Added `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` to `User` and `AuditLog`, and added `@JsonIgnore` to `User.passwordHash`.
- **Status:** RESOLVED

