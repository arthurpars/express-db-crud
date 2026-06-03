# express-db-crud

Full CRUD REST API across three databases using an e-commerce scenario:

| Database | ORM / Client | Routes |
|---|---|---|
| PostgreSQL | Prisma ORM | `/pg/users`, `/pg/products`, `/pg/orders` |
| MongoDB | Mongoose | `/mongo/users`, `/mongo/products`, `/mongo/orders` |
| Redis | ioredis | `/redis/cart/:userId` |

---

## Prerequisites

### Install Docker

**macOS / Windows:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this
```

---

## Quick Start

### 1. Install Node dependencies

```bash
cd express-db-crud
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env if you need custom passwords; defaults work with docker-compose as-is
```

### 3. Start the databases

```bash
docker compose up -d
# Wait ~10 seconds for all three containers to become healthy
docker compose ps    # all should show "healthy"
```

### 4. Run Prisma migration (PostgreSQL schema)

```bash
npm run migrate
# Applies prisma/schema.prisma to the running Postgres container
# Also runs `prisma generate` automatically
```

### 5. Seed all three databases

```bash
npm run seed
# Seeds PostgreSQL (Prisma), MongoDB (Mongoose), and Redis (ioredis)
```

### 6. Start the server

```bash
npm start          # production
npm run dev        # watch mode with nodemon
```

The server runs at `http://localhost:3000`.

---

## API Reference & curl Examples

Replace `localhost:3000` with your host if needed.

---

### Health

```bash
curl http://localhost:3000/health
```

---

### PostgreSQL — `/pg/*`

#### Users

```bash
# GET all users
curl http://localhost:3000/pg/users

# GET one user
curl http://localhost:3000/pg/users/1

# POST create user
curl -X POST http://localhost:3000/pg/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Dave Lee", "email": "dave@example.com"}'

# PUT update user
curl -X PUT http://localhost:3000/pg/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice M. Martin"}'

# DELETE user
curl -X DELETE http://localhost:3000/pg/users/1
```

#### Products

```bash
# GET all products
curl http://localhost:3000/pg/products

# GET one product
curl http://localhost:3000/pg/products/1

# POST create product
curl -X POST http://localhost:3000/pg/products \
  -H "Content-Type: application/json" \
  -d '{"name": "USB-C Hub", "price": 49.99, "stock": 200}'

# PUT update product
curl -X PUT http://localhost:3000/pg/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 1199.99, "stock": 45}'

# DELETE product
curl -X DELETE http://localhost:3000/pg/products/1
```

#### Orders

```bash
# GET all orders
curl http://localhost:3000/pg/orders

# GET one order
curl http://localhost:3000/pg/orders/1

# POST create order (userId and productId must exist)
curl -X POST http://localhost:3000/pg/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "productId": 3, "quantity": 1, "status": "pending"}'

# PUT update order
curl -X PUT http://localhost:3000/pg/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'

# DELETE order
curl -X DELETE http://localhost:3000/pg/orders/1
```

---

### MongoDB — `/mongo/*`

#### Users

```bash
# GET all users
curl http://localhost:3000/mongo/users

# GET one user (use an _id from GET all)
curl http://localhost:3000/mongo/users/<_id>

# POST create user
curl -X POST http://localhost:3000/mongo/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Eve Torres", "email": "eve@example.com"}'

# PUT update user
curl -X PUT http://localhost:3000/mongo/users/<_id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Eve T."}'

# DELETE user
curl -X DELETE http://localhost:3000/mongo/users/<_id>
```

#### Products

```bash
# GET all products
curl http://localhost:3000/mongo/products

# GET one product
curl http://localhost:3000/mongo/products/<_id>

# POST create product
curl -X POST http://localhost:3000/mongo/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Webcam 4K", "price": 89.99, "stock": 60, "category": "Electronics"}'

# PUT update product
curl -X PUT http://localhost:3000/mongo/products/<_id> \
  -H "Content-Type: application/json" \
  -d '{"stock": 55}'

# DELETE product
curl -X DELETE http://localhost:3000/mongo/products/<_id>
```

#### Orders

```bash
# GET all orders
curl http://localhost:3000/mongo/orders

# GET one order
curl http://localhost:3000/mongo/orders/<_id>

# POST create order
# userId and productId must be valid Mongo ObjectIds from the collections above
curl -X POST http://localhost:3000/mongo/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user_id>",
    "items": [
      {"productId": "<product_id>", "quantity": 2, "price": 299.99}
    ],
    "status": "pending"
  }'

# PUT update order (status or items)
curl -X PUT http://localhost:3000/mongo/orders/<_id> \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'

# DELETE order
curl -X DELETE http://localhost:3000/mongo/orders/<_id>
```

---

### Redis — `/redis/cart/:userId`

The cart is a Redis hash `cart:{userId}` mapping `productId → quantity`.
`userId` can be any string; the demo seed uses `demo-1` and `demo-2`.

```bash
# GET full cart
curl http://localhost:3000/redis/cart/demo-1

# POST add item (increments if already present)
curl -X POST http://localhost:3000/redis/cart/demo-1/item \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod-101", "quantity": 2}'

# PUT set exact quantity for an item
curl -X PUT http://localhost:3000/redis/cart/demo-1/item/prod-101 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'

# DELETE remove one item
curl -X DELETE http://localhost:3000/redis/cart/demo-1/item/prod-101

# DELETE clear entire cart
curl -X DELETE http://localhost:3000/redis/cart/demo-1
```

---

## Project Structure

```
express-db-crud/
├── docker-compose.yml
├── .env                        # local env vars (gitignore this in production)
├── .env.example
├── package.json
├── prisma/
│   ├── schema.prisma           # Prisma models: User, Product, Order
│   └── seed.js                 # Prisma seed (run via prisma db seed)
├── scripts/
│   └── seed.js                 # npm run seed — orchestrates all three seeds
└── src/
    ├── index.js                # Express app + startup
    ├── db/
    │   ├── prisma.js           # PrismaClient singleton
    │   ├── mongoose.js         # Mongoose connection
    │   └── redis.js            # ioredis client
    ├── models/mongo/
    │   ├── User.js
    │   ├── Product.js
    │   └── Order.js
    ├── routes/
    │   ├── pg/                 # PostgreSQL routes (users, products, orders)
    │   ├── mongo/              # MongoDB routes (users, products, orders)
    │   └── redis/              # Redis cart routes
    └── seeds/
        ├── mongo-seed.js
        └── redis-seed.js
```

---

## Stopping / Resetting

```bash
# Stop containers (data persists in Docker volumes)
docker compose down

# Stop and wipe all data
docker compose down -v
```
