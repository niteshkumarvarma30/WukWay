# WukWay — Food-Tech Platform

WukWay is a pre-order and pickup queue management platform.
**Core Promise:** Order before you arrive. Skip the queue. Collect when ready.

## Technology Stack (AWS + JS Ecosystem)
- **Customer App:** React Native (Android)
- **Vendor App:** React Native (Tablet optimized)
- **Admin Panel:** React.js
- **Backend:** Node.js (NestJS) + TypeScript
- **Database:** PostgreSQL (RDS)
- **Cache:** Redis (ElastiCache)
- **Queue:** AWS SQS/SNS
- **Hosting:** AWS ECS Fargate

## Monorepo Structure
- `apps/wukway-app/`: Unified mobile application for customers and restaurant partners (Role-based APK).
- `apps/admin-panel/`: Web application for internal operations.
- `backend/`: NestJS backend powering the platform.
- `docs/`: Core architectural documentation and ERDs.

## Local Setup
1. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
2. Start the database and redis using Docker:
   ```bash
   docker-compose up -d postgres redis
   ```
3. See `docs/` for complete architectural specifications.
