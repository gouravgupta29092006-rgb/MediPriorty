# MediPriority — Production Deployment & Hardening Guide

## 1. Production Build Procedures

### 1.1 Backend Packaging (Executable JAR)
Generate the standalone Spring Boot production artifact:
```powershell
cd D:\JAVA\MediPriority\backend
.\mvnw.cmd clean package -DskipTests
```
The resulting executable JAR will be located at:
`backend/target/medipriority-0.1.0-SNAPSHOT.jar`

Run the production JAR:
```powershell
java -jar -Dspring.profiles.active=prod target/medipriority-0.1.0-SNAPSHOT.jar
```

### 1.2 Frontend Compilation (Static Assets)
Compile and minify the React 18 application for web distribution:
```powershell
cd D:\JAVA\MediPriority\frontend
npm ci
npm run build
```
Optimized static bundles will be generated in `frontend/dist/`.

---

## 2. Nginx Reverse Proxy Configuration

In a production environment, place Nginx in front of Spring Boot and the static React assets:

```nginx
server {
    listen 80;
    server_name emergency.medipriority.internal;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name emergency.medipriority.internal;

    ssl_certificate     /etc/ssl/certs/medipriority.crt;
    ssl_certificate_key /etc/ssl/private/medipriority.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Static React Application
    root /var/www/medipriority/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 3. Production Security Checklist

- [ ] **JWT Signing Secret:** Override `JWT_SECRET` with an environment variable containing a 256-bit cryptographically random string (`openssl rand -base64 32`).
- [ ] **Database Credentials:** Restrict MySQL user grants to only the `medipriority_db` database, rotate default passwords, and enable TLS for database traffic.
- [ ] **Hibernate Validation:** Ensure `spring.jpa.hibernate.ddl-auto` is set to `validate` (never `update` or `create`).
- [ ] **CORS Origins:** Restrict `CORS_ALLOWED_ORIGIN` strictly to the production domain.
- [ ] **Error Traces:** Ensure `server.error.include-stacktrace: never` is active to prevent exposure of internal framework internals.

