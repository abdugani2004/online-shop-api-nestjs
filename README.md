# Online Shop Backend (NestJS)

NestJS + PostgreSQL + TypeORM backend for an e-commerce project.

## Features
- Auth: register/login with JWT
- Users: profile and admin user list
- Categories
- Products (admin create/update/delete)
- Cart (add/update/remove/clear items)
- Orders (create from cart, my orders, admin all orders)
- Role guard (`admin`, `user`)
- Pagination + search + filter

## Tech Stack
- NestJS 11
- TypeORM
- PostgreSQL
- JWT + Passport
- class-validator / class-transformer

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` from `.env.example` and set DB/JWT values.

3. Run app:
```bash
npm run start:dev
```

## Build
```bash
npm run build
```

## Main API Routes
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /users` (admin)
- `GET /categories`
- `POST /categories` (admin)
- `GET /products?search=&categoryId=&minPrice=&maxPrice=&page=&limit=`
- `POST /products` (admin)
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `POST /orders`
- `GET /orders/my`
- `GET /orders/admin` (admin)
- `PATCH /orders/:id/status` (admin)

## Notes
- Default DB sync is enabled with `DB_SYNC=true` for development.
- For production, use migrations and set `DB_SYNC=false`.
