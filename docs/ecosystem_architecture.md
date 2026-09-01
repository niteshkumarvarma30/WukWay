# Ecosystem Architecture (AWS + JS Stack)

Based on `1_ecosystem.mmd` and the technical spec, the stack is:

## Client Applications
1. **WukWay App:** Unified React Native APK (Android) for both Customers and Vendors. Uses role-based routing post-login.
2. **Admin Panel:** React.js (Web Dashboard)

## Backend Platform (AWS)
1. **API:** Node.js + NestJS (REST / WebSocket API)
2. **Database:** PostgreSQL (Amazon RDS)
3. **Cache:** Redis (Amazon ElastiCache)
4. **Message Queue:** SQS / SNS for Order Event Queues

## Third-Party Services
- **Google Maps / Places API:** For location and distance estimates
- **Razorpay:** UPI Payments
- **Firebase Cloud Messaging (FCM):** Push notifications
- **SMS / OTP Gateway:** MSG91 or Twilio
- **S3:** Images & Assets storage
