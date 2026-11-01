# KNOWN LIMITATIONS — MediPriority

## Current Prototype Limitations

| ID | Limitation | Category | Future Resolution |
|---|---|---|---|
| L-001 | Simulated road network (no real GPS) | Functionality | Integrate Google Maps / OpenStreetMap API |
| L-002 | No real-time notifications (polling only) | UX | Add WebSocket / SSE for live updates |
| L-003 | No mobile application | Platform | React Native or PWA |
| L-004 | JWT token cannot be server-side invalidated on logout | Security | Add token blocklist (Redis) |
| L-005 | No password complexity enforcement | Security | Add regex validator on registration |
| L-006 | No rate limiting on API | Security | Add Spring Security or API Gateway rate limiting |
| L-007 | Single-hospital scope | Scale | Multi-hospital networking |
| L-008 | No email notifications | Communication | SMTP integration |
| L-009 | Analytics uses database queries (no pre-aggregation) | Performance | Add scheduled aggregation jobs |
| L-010 | No patient photo or document upload | Functionality | File storage integration |
| L-011 | Ambulance location is a graph node, not real GPS | Functionality | GPS tracking integration |
| L-012 | No print/export of reports | Functionality | PDF generation (JasperReports or iText) |
| L-013 | No two-factor authentication | Security | TOTP / SMS 2FA |
| L-014 | No automated reassessment reminders | Clinical | Scheduled background job |
| L-015 | No EHR/EMR integration | Integration | HL7 FHIR API |

## Academic Context

This application is a prototype built for academic evaluation. It demonstrates:
- Custom DSA implementations
- Spring Boot full-stack development
- MySQL database design
- Security fundamentals
- REST API design

It is not intended for production clinical use without significant additional validation, regulatory approval, and security hardening.
