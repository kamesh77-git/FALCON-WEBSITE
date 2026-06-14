# Falcons Logistics Management System

A full-stack logistics management platform built with **Spring Boot** and **React**, featuring JWT-based authentication, role-based access control (RBAC), shipment tracking, and invoice management.

---

## Tech Stack

### Backend
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 3.3.5 |
| Spring Security | JWT Auth |
| Spring Data JPA | Hibernate |
| MySQL | 8.x |
| Lombok | Latest |

### Frontend
| Technology | Version |
|---|---|
| React | 19 |
| TypeScript | 6 |
| Vite | 8 |
| Tailwind CSS | 3 |
| React Router | 6 |
| Axios | 1 |
| React Hook Form + Zod | Latest |

---

## Features

- **JWT Authentication** — Secure login with token-based session management
- **Role-Based Access Control** — Three role levels: `CEO Admin`, `Super Admin`, `Admin`
- **Shipment Management** — Create, track, and update shipment delivery status
- **Invoice Management** — Generate and manage invoices linked to shipments
- **User Management** — Create, update, and assign roles to users
- **Dashboard** — Overview of key logistics metrics with stats cards
- **Responsive UI** — Modern SaaS-style interface with Tailwind CSS

---

## Roles & Permissions

| Role | Access Level |
|---|---|
| `ROLE_CEO_ADMIN` | Full access — all modules, user management, reports |
| `ROLE_SUPER_ADMIN` | Shipments, invoices, user management |
| `ROLE_ADMIN` | Shipment tracking and invoice viewing |

---

## Project Structure

```
falcons-logistics/
├── src/                          # Spring Boot backend
│   └── main/
│       ├── java/com/falcons/logistics/
│       │   ├── config/           # CORS, Security, Data seeding
│       │   ├── controller/       # REST controllers
│       │   ├── dto/              # Request & Response DTOs
│       │   ├── entity/           # JPA entities
│       │   ├── enums/            # RoleName, ShipmentStatus
│       │   ├── exception/        # Global exception handling
│       │   ├── repository/       # JPA repositories
│       │   ├── security/         # JWT filter, UserDetails
│       │   └── service/          # Business logic
│       └── resources/
│           └── application.properties
├── frontend/                     # React + Vite frontend
│   └── src/
│       ├── api/                  # Axios API clients
│       ├── components/           # Reusable UI components
│       ├── context/              # Auth & Toast context
│       ├── hooks/                # Custom React hooks
│       ├── pages/                # Page components
│       └── types/                # TypeScript types
└── pom.xml
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8.x

---

### Backend Setup

**1. Configure the database**

Update `src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/falcons_logistics?createDatabaseIfNotExist=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

**2. Run the backend**

```bash
./mvnw spring-boot:run
```

The API will start at `http://localhost:8080`.

> On first startup, default users are automatically seeded into the database.

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| CEO Admin | `ceo@falcons.com` | `Ceo@123` |
| Super Admin | `superadmin@falcons.com` | `Super@123` |
| Admin | `admin@falcons.com` | `Admin@123` |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/shipments` | List all shipments |
| `POST` | `/api/shipments` | Create a new shipment |
| `PUT` | `/api/shipments/{id}/delivery-date` | Update delivery date |
| `GET` | `/api/invoices` | List all invoices |
| `POST` | `/api/invoices` | Create invoice for shipment |
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a new user |
| `PUT` | `/api/users/{id}/role` | Update user role |

---

## Shipment Status Flow

```
NOT_DELIVERED  →  DELIVERED  →  INVOICED
```

---

## Build for Production

**Backend JAR:**
```bash
./mvnw clean package
java -jar target/logistics-1.0.0.jar
```

**Frontend:**
```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`.
