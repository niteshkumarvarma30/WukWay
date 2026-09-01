# NestJS API Specification

## Auth
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`

## Customer App
- `GET /api/outlets/nearby` (Uses PostGIS / Haversine)
- `GET /api/outlets/:id/menu`
- `POST /api/orders`
- `GET /api/orders/my-orders`

## Vendor App
- `GET /api/vendor/orders`
- `PATCH /api/vendor/orders/:id/status`
- `PATCH /api/vendor/menu/:id/availability`

## Admin Panel
- `GET /api/admin/outlets`
- `PATCH /api/admin/outlets/:id/approve`
- `GET /api/admin/analytics`
