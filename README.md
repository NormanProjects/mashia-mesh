<img width="530" height="527" alt="Screenshot 2026-02-12 114154" src="https://github.com/user-attachments/assets/cfd6924f-0336-421a-a13f-a8ce4f50f67c" />

# MashiaMesh — Online Food Delivery Platform

A production-grade, microservices-based food delivery platform built with **Spring Boot**, **Spring Cloud**, and **React**. Designed as a portfolio project demonstrating enterprise-level backend architecture, RESTful API design, JWT authentication, and Salesforce CRM integration.

---

##  Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Microservices](#microservices)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

MashiaMesh is a full-stack food delivery system that connects customers, restaurant owners, and delivery drivers. It is built using a microservices architecture where each domain is an independently deployable service communicating through a centralized API Gateway.

📐 For full system architecture, diagrams, database design, and service flows see:
**[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

**Key Features:**
- JWT-based stateless authentication
- Service discovery with Netflix Eureka
- Centralized routing and rate limiting via Spring Cloud Gateway
- Full order lifecycle management (PENDING → DELIVERED)
- Payment processing with refund support
- Swagger UI documentation on every service
- PostgreSQL persistence across all services

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Core language |
| Spring Boot 3.2.5 | Service framework |
| Spring Cloud 2023.0.1 | Microservices toolkit |
| Spring Cloud Gateway | API Gateway and routing |
| Netflix Eureka | Service discovery and registry |
| Spring Security | Authentication and authorization |
| Spring Data JPA | Database ORM |
| JWT (jjwt 0.11.5) | Stateless authentication tokens |
| BCrypt | Password hashing |
| Hibernate | ORM and schema management |
| Maven | Build and dependency management |
| Lombok | Boilerplate reduction |
| SpringDoc OpenAPI | Swagger API documentation |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL 15 | Primary relational database |
| HikariCP | Database connection pooling |

### Frontend 
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Redux Toolkit | State management |
| Tailwind CSS | Styling |

### DevOps *(planned)*
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Local orchestration |
| GitHub Actions | CI/CD pipeline |

---

## Microservices

| Service | Port | Responsibility |
|---|---|---|
| Discovery Server | 8761 | Eureka service registry |
| API Gateway | 8080 | Routing, JWT validation, rate limiting |
| User Service | 8081 | Auth, registration, JWT tokens |
| Restaurant Service | 8082 | Restaurant profiles and menus |
| Order Service | 8083 | Full order lifecycle |
| Payment Service | 8084 | Payments and refunds |

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed service responsibilities, request flows, and state machine diagrams.

---

## Getting Started

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Java JDK | 17 | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org |
| PostgreSQL | 15 | https://www.postgresql.org/download/windows |
| IntelliJ IDEA | Any | https://www.jetbrains.com/idea |
| Git | Latest | https://git-scm.com |
| Postman | Latest | https://www.postman.com/downloads |

---

### Database Setup

Open **SQL Shell (psql)** and run:

```sql
CREATE DATABASE mashiamesh_db;
\q
```

---

### Running the Services

Start services **in this exact order:**

```
1. DiscoveryServerApplication    → http://localhost:8761
2. ApiGatewayApplication         → http://localhost:8080
3. UserServiceApplication        → http://localhost:8081
4. RestaurantServiceApplication  → http://localhost:8082
5. OrderServiceApplication       → http://localhost:8083
6. PaymentServiceApplication     → http://localhost:8084
```

Verify all services are registered at: http://localhost:8761

---

### Quick Test

**1. Register a user:**
```bash
POST http://localhost:8081/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Ntokozo",
  "lastName": "Mashia",
  "email": "ntokozo@mashiamesh.com",
  "password": "password123",
  "phone": "0821234567"
}
```

**2. Create a restaurant:**
```bash
POST http://localhost:8082/api/v1/restaurants
Content-Type: application/json

{
  "name": "Ntokozo's Kitchen",
  "description": "Best food in Johannesburg",
  "address": "123 Sandton Drive",
  "city": "Johannesburg",
  "cuisineType": "South African",
  "ownerId": 1
}
```

**3. Place an order:**
```bash
POST http://localhost:8083/api/v1/orders
Content-Type: application/json

{
  "customerId": 1,
  "restaurantId": 1,
  "restaurantName": "Ntokozo's Kitchen",
  "deliveryAddress": "456 Rosebank, Johannesburg",
  "items": [
    {
      "menuItemId": 1,
      "itemName": "Pap and Wors",
      "unitPrice": 89.99,
      "quantity": 2
    }
  ]
}
```

**4. Process payment:**
```bash
POST http://localhost:8084/api/v1/payments
Content-Type: application/json

{
  "orderId": 1,
  "customerId": 1,
  "amount": 204.98,
  "paymentMethod": "CREDIT_CARD"
}
```

---

## API Documentation

Swagger UI is available on every service after startup:

| Service | Swagger UI |
|---|---|
| User Service | http://localhost:8081/swagger-ui/index.html |
| Restaurant Service | http://localhost:8082/swagger-ui/index.html |
| Order Service | http://localhost:8083/swagger-ui/index.html |
| Payment Service | http://localhost:8084/swagger-ui/index.html |

---

## Project Structure

```
mashia-mesh/
├── .gitignore
├── README.md
├── docs/
│   └── ARCHITECTURE.md          ← System design, diagrams, DB schema
└── backend/
    ├── pom.xml                   ← Parent POM (Spring Boot 3.2.5)
    ├── discovery-server/
    ├── api-gateway/
    ├── user-service/
    ├── restaurant-service/
    ├── order-service/
    └── payment-service/
```

---

## Roadmap

| Phase | Service | Status |
|---|---|---|
| Phase 1 | Discovery Server | ✅ Complete |
| Phase 2 | API Gateway | ✅ Complete |
| Phase 3 | User Service | ✅ Complete |
| Phase 4 | Restaurant Service | ✅ Complete |
| Phase 5 | Order Service | ✅ Complete |
| Phase 6 | Payment Service | ✅ Complete |
| Phase 7 | Delivery Service | ⏳ Planned |
| Phase 8 | Notification Service | ⏳ Planned |
| Phase 9 | Salesforce CRM Integration | ⏳ Planned |
| Phase 10 | React Frontend | ⏳ Planned |

---

## Author

**Ntokozo Mashia**
- GitHub: [github.com/NormanProjects](https://github.com/NormanProjects)
- Repository: [github.com/NormanProjects/mashia-mesh](https://github.com/NormanProjects/mashia-mesh)

---

*Built with Java and Spring Boot*





