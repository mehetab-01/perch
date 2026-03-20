# Perch — Project Context

## What is Perch?
Airbnb-style marketplace where cafes list their spaces and professionals book them for business meetings. Full payment flow via Razorpay with escrow-like settlements.

## Tech Stack
- **Framework**: Next.js 15 (App Router, React Server Components, TypeScript)
- **Auth**: Clerk (Google OAuth + email/password + OTP)
- **Database**: Neon PostgreSQL + Drizzle ORM + PostGIS
- **Payments**: Razorpay (Standard Checkout + Route for split payments)
- **File Upload**: Uploadthing (documents) + Cloudinary (images)
- **Email**: Resend + React Email
- **Styling**: Tailwind CSS v4 + Radix Primitives + Framer Motion + Aceternity UI + shadcn/ui
- **Analytics**: PostHog
- **Hosting**: Vercel
- **Package Manager**: pnpm

## Architecture Rules
- All pages use App Router with route groups: (public), (auth), (worker), (cafe)
- Server Components by default. Add "use client" ONLY when needed (interactivity, hooks, browser APIs)
- API routes in /src/app/api/ — use Drizzle ORM for all DB queries
- Clerk middleware protects (worker) and (cafe) routes
- Role-based access: user.publicMetadata.role = "worker" | "cafe_owner" | "admin"
- All form validation with Zod schemas in /src/lib/validators/
- Reusable UI components in /src/components/ui/

## Database
- Neon PostgreSQL accessed via @neondatabase/serverless driver
- Drizzle ORM for type-safe queries — schema in /src/lib/db/schema.ts
- Migrations via drizzle-kit: `pnpm drizzle-kit generate` then `pnpm drizzle-kit migrate`
- PostGIS extension for geospatial queries (cafe search by location)
- Always use parameterized queries — never interpolate user input

## Styling Rules
- Tailwind CSS for all styling. No CSS modules, no styled-components
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Framer Motion for all animations — import from "framer-motion"
- Mobile-first: design for 375px width first, then scale up
- Dark mode support via Tailwind `dark:` prefix
- Color tokens defined in tailwind.config.ts — never use hardcoded colors
- Aceternity UI components: copy into /src/components/ui/ and customize

## Naming Conventions
- Files: kebab-case (cafe-card.tsx, booking-form.tsx)
- Components: PascalCase (CafeCard, BookingForm)
- API routes: REST-style (GET /api/cafes, POST /api/bookings)
- DB tables: snake_case (cafe_spaces, booking_invites)
- TypeScript types: PascalCase in /src/types/

## Testing
- No test framework yet — will add Vitest in Phase 3
- For now: TypeScript strict mode catches most issues
- Manual testing via Vercel preview deployments

## Commands
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — run ESLint
- `pnpm drizzle-kit generate` — generate migration
- `pnpm drizzle-kit migrate` — run migration
- `pnpm drizzle-kit studio` — open Drizzle Studio (DB GUI)

## Git Workflow
- main branch = production (auto-deploys to Vercel)
- dev branch = staging
- Feature branches: feature/cafe-onboarding, feature/booking-flow, etc.
- Commit messages: conventional commits (feat:, fix:, chore:, docs:)
- Both devs review each other's PRs before merge

## Important Constraints
- NEVER use Supabase — we use Neon + Clerk + Uploadthing instead
- NEVER use default export — always named exports
- NEVER use `any` type — always define proper TypeScript types
- NEVER store sensitive data in client-side code
- All meeting content (title, agenda) must be encrypted at rest
- Phone numbers never exposed cross-role (worker can't see cafe owner's phone)
- DPDP Act compliance: explicit consent, data minimization, 72hr breach notification
