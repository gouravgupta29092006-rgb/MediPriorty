# SECURITY — MediPriority

## Authentication

MediPriority uses stateless JWT (JSON Web Token) authentication.

**Flow:**
1. User submits email + password to `POST /api/auth/login`
2. Spring Security validates credentials against the database
3. Password is verified with BCrypt
4. On success, a signed JWT is returned
5. All subsequent requests include the JWT in the `Authorization: Bearer <token>` header
6. JwtAuthenticationFilter validates the token on every request before routing

**Token properties:**
- Algorithm: HS256 (HMAC-SHA256)
- Expiry: 24 hours (configurable)
- Claims: user_id, email, role
- Signed with a secret key loaded from environment variable (never hardcoded)

---

## Password Security

- BCrypt with strength factor 12
- Spring Security's BCryptPasswordEncoder handles salting automatically
- Passwords are never stored in plaintext
- Passwords are never logged
- Password is never returned in any API response

---

## Authorization

Role-based access control enforced at two levels:

1. **Method level:** `@PreAuthorize` annotations on service methods
2. **HTTP level:** `SecurityFilterChain` route protection

| Endpoint Pattern | Allowed Roles |
|---|---|
| POST /api/auth/** | Public |
| GET /api/dashboard/** | ADMIN, DISPATCHER, MEDICAL_OFFICER |
| POST /api/patients | DISPATCHER, ADMIN |
| POST /api/triage/** | MEDICAL_OFFICER, ADMIN |
| POST /api/allocations/ambulance/** | DISPATCHER (Strictly enforced) |
| PATCH /api/allocations/ambulance/** | DISPATCHER (Strictly enforced) |
| POST /api/allocations/bed/auto, /manual | MEDICAL_OFFICER, ADMIN |
| PATCH /api/allocations/bed/*/admit, /release | MEDICAL_OFFICER, ADMIN |
| GET /api/allocations/** | DISPATCHER, MEDICAL_OFFICER, ADMIN |
| GET /api/audit-logs | ADMIN |
| POST /api/users | ADMIN |
| PUT /api/users/** | ADMIN |
| POST /api/ambulances | ADMIN |
| POST /api/beds | ADMIN |

---

## Authentication Entry Point & Failure Handling

Unauthenticated requests to protected endpoints are intercepted by a dedicated `AuthenticationEntryPoint` in `SecurityConfig.java`, returning:
- HTTP Status: `401 Unauthorized`
- Body: `{"error":"Unauthorized","message":"Authentication required"}`
- Content-Type: `application/json`

Forbidden actions by authenticated users lacking specific roles (e.g., ADMIN attempting ambulance auto-dispatch) return:
- HTTP Status: `403 Forbidden`
| POST /api/beds | ADMIN |

---

## Input Validation

All request DTOs are validated with `@Valid` and Bean Validation annotations:
- `@NotBlank`, `@NotNull` — required fields
- `@Email` — email format
- `@Size` — string length limits
- `@Pattern` — format validation
- Custom validators for enum values

Invalid requests return `400 Bad Request` with a structured error body. No stack traces are exposed.

---

## API Security

- All endpoints except `/api/auth/**` require a valid JWT
- HTTP 401 for missing/invalid token
- HTTP 403 for insufficient role
- Error responses never reveal internal implementation details

---

## CORS

CORS is configured in `CorsConfig.java`:
- Allowed origin: `http://localhost:5173` in development
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Authorization, Content-Type
- Credentials: true
- Production origin configured via environment variable

---

## Patient Data Protection

- No real patient data in test or seed scripts
- All seed data uses clearly fictional names and details
- Patient records are accessible only to authenticated users with appropriate roles
- Audit logs record who accessed and modified patient records

---

## Credential Management

- Database passwords stored in environment variables
- JWT secret stored in environment variable
- `application.yml` uses `${ENV_VAR_NAME}` placeholders
- `application-example.yml` contains placeholder values only
- `.env.example` documents required variables
- `.gitignore` excludes:
  - application-local.yml
  - .env
  - Any file containing credentials

---

## SQL Injection Prevention

- Spring Data JPA and JPQL parameterized queries
- No string concatenation in queries
- Native queries use named parameters

---

## Known Security Considerations

- Initial version uses a single JWT secret (symmetric); future versions should consider RS256 (asymmetric)
- No rate limiting implemented in initial version
- No password complexity enforcement beyond minimum length (should be added)
- Token invalidation requires a token blocklist (not implemented in v1; logout is client-side)
