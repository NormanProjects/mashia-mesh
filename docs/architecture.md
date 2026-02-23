# MashiaMesh — System Architecture

## Overview

MashiaMesh uses a **microservices architecture** where each business domain is an independently deployable service. All client traffic flows through a single API Gateway, services register with Eureka for discovery, and each service owns its own data in a shared PostgreSQL instance.

---

## System Diagram

```
                        ┌─────────────────────┐
                        │   React Frontend     │
                        │   (Port 3000)        │
                        └──────────┬──────────┘
                                   │ HTTP
                        ┌──────────▼──────────┐
                        │    API Gateway       │
                        │    (Port 8080)       │
                        │  JWT Validation      │
                        │  Rate Limiting       │
                        │  Load Balancing      │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
   ┌──────────▼──────┐  ┌─────────▼────────┐  ┌───────▼───────────┐
   │  User Service   │  │Restaurant Service │  │  Order Service    │
   │  (Port 8081)    │  │  (Port 8082)      │  │  (Port 8083)      │
   └─────────────────┘  └──────────────────┘  └───────────────────┘
              │
   ┌──────────▼──────┐
   │ Payment Service │
   │  (Port 8084)    │
   └─────────────────┘
              │
   ┌──────────▼──────────────────────────────────────────┐
   │              Discovery Server (Eureka)               │
   │                     (Port 8761)                      │
   └──────────────────────────────────────────────────────┘
              │
   ┌──────────▼──────────────────────────────────────────┐
   │                    PostgreSQL                        │
   │                    (Port 5432)                       │
   │         mashiamesh_db — shared database             │
   └──────────────────────────────────────────────────────┘
```

---

## Service Responsibilities

### Discovery Server — Port 8761
- Netflix Eureka service registry
- All services self-register on startup
- Services resolve each other by name (e.g. `lb://user-service`) instead of hardcoded URLs
- Dashboard: http://localhost:8761

### API Gateway — Port 8080
- Single entry point for all client requests
- **JWT Authentication Filter** — validates tokens on every protected request
- **Rate Limiting Filter** — 60 requests per minute per IP (in-memory, Redis in production)
- Routes traffic to downstream services using Eureka load balancing
- Forwards user context as headers: `X-User-Id`, `X-User-Role`, `X-User-Email`

### User Service — Port 8081
- User registration with BCrypt password hashing
- JWT access token (24h) and refresh token (7 days) generation
- Spring Security — stateless session management
- Owns: `users` table

### Restaurant Service — Port 8082
- Restaurant profile management (create, update, deactivate)
- Menu item management per restaurant
- Filter restaurants by city and cuisine type
- Owns: `restaurants`, `menu_items` tables

### Order Service — Port 8083
- Place orders with multiple items
- Calculates subtotal, delivery fee, and total automatically
- State machine for order lifecycle with transition validation
- Owns: `orders`, `order_items` tables

### Payment Service — Port 8084
- Payment processing per order (one payment per order enforced)
- Full and partial refund support
- Simulated payment gateway (90% success rate) — ready for real gateway integration
- Owns: `payments` table

---

## Request Flow

### Authentication Flow
```
Client → POST /api/v1/auth/register → API Gateway → User Service
                                                         ↓
                                               Validate input
                                                         ↓
                                               Hash password (BCrypt)
                                                         ↓
                                               Save to PostgreSQL
                                                         ↓
                                               Generate JWT tokens
                                                         ↓
Client ← AuthResponse (accessToken, refreshToken) ←────────
```

### Protected Request Flow
```
Client → GET /api/v1/restaurants → API Gateway
                                        ↓
                                 Extract JWT from header
                                        ↓
                                 Validate token (signature + expiry)
                                        ↓
                                 Forward headers (X-User-Id, X-User-Role)
                                        ↓
                                 Route to Restaurant Service (via Eureka)
                                        ↓
Client ← JSON response ←────────────────
```

### Order + Payment Flow
```
1. POST /api/v1/orders          → Order Service   → Creates order (PENDING)
2. POST /api/v1/payments        → Payment Service → Processes payment
3. PATCH /api/v1/orders/1/status?status=CONFIRMED → Order Service
4. PATCH /api/v1/orders/1/status?status=PREPARING → Order Service
5. PATCH /api/v1/orders/1/status?status=READY     → Order Service
6. PATCH /api/v1/orders/1/status?status=OUT_FOR_DELIVERY → Order Service
7. PATCH /api/v1/orders/1/status?status=DELIVERED → Order Service
```

---

## Database Design

All services share one PostgreSQL database (`mashiamesh_db`) but own separate tables — simulating logical database separation without the overhead of multiple databases in local development.

### Tables

```
users
├── id (PK)
├── email (UNIQUE)
├── password (BCrypt hashed)
├── first_name, last_name, phone
├── role (CUSTOMER | RESTAURANT_OWNER | DELIVERY_DRIVER | ADMIN)
├── enabled
└── created_at, updated_at

restaurants
├── id (PK)
├── name, description, address, city, phone, email
├── cuisine_type
├── rating
├── active
├── owner_id (FK → users.id logically)
└── created_at, updated_at

menu_items
├── id (PK)
├── restaurant_id (FK → restaurants.id)
├── name, description, price
├── category
├── image_url
└── available

orders
├── id (PK)
├── customer_id (FK → users.id logically)
├── restaurant_id (FK → restaurants.id logically)
├── restaurant_name
├── delivery_address
├── special_instructions
├── status (PENDING | CONFIRMED | PREPARING | READY | OUT_FOR_DELIVERY | DELIVERED | CANCELLED)
├── subtotal, delivery_fee, total_amount
└── created_at, updated_at

order_items
├── id (PK)
├── order_id (FK → orders.id)
├── menu_item_id
├── item_name, unit_price, quantity, subtotal

payments
├── id (PK)
├── order_id (UNIQUE)
├── customer_id
├── amount
├── payment_method (CREDIT_CARD | DEBIT_CARD | EFT | CASH_ON_DELIVERY | WALLET)
├── status (PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED | PARTIALLY_REFUNDED)
├── transaction_reference
├── failure_reason
├── refunded_amount
└── created_at, updated_at
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│                  API Gateway                     │
│                                                  │
│  JwtAuthenticationFilter                         │
│  ├── Skip: /api/v1/auth/**, /actuator/health     │
│  ├── Extract: Authorization: Bearer <token>      │
│  ├── Validate: signature + expiry                │
│  ├── Forward: X-User-Id, X-User-Role headers     │
│  └── Reject: 401 if invalid                      │
│                                                  │
│  RateLimitingFilter                              │
│  ├── 60 requests/minute per IP                   │
│  └── 429 Too Many Requests if exceeded           │
└─────────────────────────────────────────────────┘

JWT Token Structure:
{
  "sub": "user@email.com",
  "firstName": "Ntokozo",
  "email": "user@email.com",
  "role": "CUSTOMER",
  "iat": 1234567890,
  "exp": 1234654290    ← 24 hours
}
```

---

## Service Ports Reference

| Service | Port | URL |
|---|---|---|
| Discovery Server | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| User Service | 8081 | http://localhost:8081 |
| Restaurant Service | 8082 | http://localhost:8082 |
| Order Service | 8083 | http://localhost:8083 |
| Payment Service | 8084 | http://localhost:8084 |
| PostgreSQL | 5432 | localhost:5432 |

---

## Order Status State Machine

```
                    ┌─────────┐
                    │ PENDING │ ◄── Initial state on order creation
                    └────┬────┘
                         │ Restaurant confirms
                    ┌────▼────┐
                    │CONFIRMED│
                    └────┬────┘
                         │ Kitchen starts cooking
                    ┌────▼────┐
                    │PREPARING│
                    └────┬────┘
                         │ Food is ready
                    ┌────▼────┐
                    │  READY  │
                    └────┬────┘
                         │ Driver picks up
               ┌─────────▼──────────┐
               │  OUT_FOR_DELIVERY  │
               └─────────┬──────────┘
                         │ Delivered to customer
                    ┌────▼─────┐
                    │DELIVERED │
                    └──────────┘

CANCELLED ◄── Allowed from PENDING or CONFIRMED only
```

---

## Payment Status State Machine

```
┌─────────┐     ┌────────────┐     ┌───────────┐
│ PENDING │────►│ PROCESSING │────►│ COMPLETED │
└─────────┘     └─────┬──────┘     └─────┬─────┘
                      │                  │
                 ┌────▼────┐        ┌────▼──────────────┐
                 │ FAILED  │        │     REFUNDED       │
                 └─────────┘        │ PARTIALLY_REFUNDED │
                                    └────────────────────┘
```

---

## Planned Phases

| Phase | Service | Description |
|---|---|---|
| 7 | Delivery Service | Driver assignment, real-time tracking |
| 8 | Notification Service | Email, SMS, push notifications |
| 9 | Salesforce CRM Integration | Customer data sync, marketing automation |
| 10 | React Frontend | Customer, restaurant, and driver portals |
