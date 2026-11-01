# TECH STACK — MediPriority

## Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 (LTS) | Primary backend language |
| Spring Boot | 3.3.x | Application framework |
| Spring Web (MVC) | 3.3.x | REST API controllers |
| Spring Data JPA | 3.3.x | Repository abstraction |
| Spring Security | 6.x | Authentication and authorization |
| Spring Validation | 3.3.x | Request DTO validation |
| Hibernate ORM | 6.x | JPA implementation |
| Flyway | 10.x | Database migrations |
| JJWT (jjwt-api) | 0.12.x | JWT token generation and validation |
| BCrypt (Spring Security Crypto) | bundled | Password hashing |
| Maven | 3.9.x | Build and dependency management |
| Swagger / SpringDoc OpenAPI | 2.5.x | API documentation |
| Lombok | 1.18.x | Boilerplate reduction |
| Jackson | 2.17.x | JSON serialization (bundled with Spring) |

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.x | UI component framework |
| TypeScript | 5.4.x | Type-safe JavaScript |
| Vite | 5.x | Build tool and dev server |
| Tailwind CSS | 3.4.x | Utility-first CSS framework |
| React Router | 6.x | Client-side routing |
| Axios | 1.7.x | HTTP client |
| TanStack Query (React Query) | 5.x | Server state management and caching |
| Recharts | 2.x | Chart library |
| Lucide React | 0.400.x | Icon library |
| React Hook Form | 7.x | Form state management |
| date-fns | 3.x | Date formatting utilities |
| react-hot-toast | 2.x | Toast notifications |

## Database

| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.0+ | Primary relational database |
| MySQL Connector/J | 8.4.x | JDBC driver |
| InnoDB | (engine) | Transactional storage |

## Testing

| Technology | Version | Purpose |
|---|---|---|
| JUnit 5 (Jupiter) | 5.10.x | Backend unit and integration testing |
| Mockito | 5.x | Mocking framework |
| Spring Boot Test | 3.3.x | Integration test context |
| MockMvc | bundled | REST API endpoint testing |
| H2 Database | 2.x | In-memory DB for tests |

## Development Tools

| Technology | Purpose |
|---|---|
| Git | Version control |
| GitHub | Remote repository |
| Maven Wrapper (mvnw) | Reproducible Maven builds |
| Spring Boot DevTools | Hot reload in development |
| MySQL Workbench | Database visualization |
| IntelliJ IDEA / VS Code | Recommended IDEs |

## Version Pin Strategy

All dependency versions are pinned in `pom.xml` and `package.json` to ensure reproducibility. No version ranges (e.g., `^` or `~`) are used for production dependencies.

## Why These Choices

| Decision | Reason |
|---|---|
| Java 21 | LTS release with virtual threads; excellent Spring Boot 3 support |
| Spring Boot 3.3 | Latest stable; native support for Java 21 |
| MySQL 8 | Widely supported; JSON column support; strong ACID guarantees |
| Flyway | SQL-based migrations; easy to review and audit |
| React + Vite | Fast builds; excellent TypeScript support |
| TanStack Query | Eliminates manual loading/error state management |
| Tailwind CSS | Rapid professional UI without custom CSS overhead |
| JJWT | Widely used; actively maintained JWT library for Java |
| No Redis | Scope doesn't require distributed caching |
| No Docker | Keeps local setup simple for academic evaluation |
