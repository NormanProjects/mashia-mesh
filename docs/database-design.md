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
