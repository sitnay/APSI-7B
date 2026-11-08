# Kopi OZ project guide

## Project overview
- Framework: Next.js 16 + React 19 + Prisma + PostgreSQL
- Main purpose: internal staff access for Kopi OZ with role-based access for Pemilik and Kasir
- This project is not a generic dashboard template; it follows the Figma flow and operational scope described in the task brief

## Implemented access
- Pemilik: login via database-backed username/password, access to owner dashboard and sales reporting
- Kasir: login via database-backed username/password, access to cashier dashboard and payment handling
- Barista and Supervisor Stok are intentionally displayed on the landing page as actor choices but remain unavailable in the current implementation

## Important constraints
- Do not create authentication or business feature pages for Barista/Supervisor Stok unless explicitly requested
- The login flow must validate both username/password and selected actor role
- Only Pemilik and Kasir can authenticate successfully
- The landing page must show all four actor choices, then show a clear unavailable message for the two unimplemented actors
- Session-based protection is required for authenticated pages

## Key files
- app/page.tsx: landing page and actor selection/login UI
- app/api/login/route.ts: backend login validation and role enforcement
- app/api/payments/route.ts: cashier payment processing
- lib/coffee-oz.ts: auth/session logic and app utilities
- lib/prisma.ts: Prisma singleton
- prisma/schema.prisma: database schema

## Local run
- npm install
- npm run dev
- Open http://localhost:3000

## Notes
- Credentials are stored as hashed passwords in the database; do not expose secrets or hardcode credentials in frontend code
- Do not claim unavailable features as implemented
