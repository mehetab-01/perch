# Perch — Agent Instructions

## Project Overview
Marketplace for booking meeting spaces in cafes. Next.js 15, Clerk auth, Neon PostgreSQL, Drizzle ORM, Razorpay payments.

## Build & Test
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- DB migrate: `pnpm drizzle-kit migrate`

## Code Standards
- TypeScript strict mode — no `any`
- Named exports only
- Server Components by default
- Zod validation for all inputs
- Drizzle ORM for all database queries
- Tailwind CSS + Framer Motion for UI
- Mobile-first responsive design
