# Perch — Product Requirements Document

## Overview
Perch is an Airbnb-style marketplace connecting professionals (workers) who need meeting spaces with cafes that have available tables and rooms. Workers discover, book, and pay for spaces; cafe owners list their spaces, manage availability, and receive payouts.

## User Roles
1. **Worker** — Books meeting spaces for professional use
2. **Cafe Owner** — Lists and manages cafe spaces, receives payouts
3. **Admin** — Platform oversight, verification, dispute resolution

## Core User Journeys

### Worker Journey
1. Land on homepage → browse featured spaces
2. Sign up / sign in (Google OAuth, email, OTP)
3. Search spaces by location, date, time, capacity, amenities, price
4. View space details (photos, amenities, availability, ratings)
5. Book a space (select date/time, add meeting title & agenda, add attendees)
6. Pay via Razorpay (Standard Checkout)
7. Receive booking confirmation email
8. Check-in on the day
9. Post-booking: leave a rating & review
10. Manage invites (accept/decline team bookings)

### Cafe Owner Journey
1. Sign up as cafe owner
2. Create cafe profile (name, address, GST, FSSAI license upload)
3. Submit for verification (admin reviews license docs)
4. Add spaces (photos, capacity, amenities, pricing, availability schedule)
5. Manage bookings (confirm, track check-ins)
6. View earnings & payout status
7. Respond to reviews

## Features

### Authentication
- Clerk-powered: Google OAuth, email/password, OTP
- Role selection at signup (worker vs cafe_owner)
- Middleware-protected routes for /worker/* and /cafe/*

### Landing Page
- Animated hero with mesh gradients
- Featured spaces carousel (top-rated)
- How It Works section (4 steps for both roles)
- Trust bar (partner logos, testimonials)
- CTA for cafe owners to onboard

### Space Search & Discovery
- Location-based search using PostGIS geospatial queries
- Filters: date, time, capacity, amenities, noise level, price range
- Sort by: distance, price, rating
- Space cards with photos, price, rating, key amenities

### Booking Flow
- Date & time slot selection (based on availability schedule)
- Meeting details (title, agenda — encrypted at rest)
- Attendee count validation (capacity check)
- Invite co-workers via email
- Razorpay payment (total = hours × price_per_hour)
- Platform fee deducted; cafe receives payout

### Payments (Razorpay)
- Standard Checkout for worker payments
- Razorpay Route for split: platform fee + cafe payout
- Webhook confirms payment captured
- Refund flow for cancellations

### Notifications
- Email: booking confirmation, cancellation, invite, review reminder
- In-app: booking status updates, invite received

### Reviews & Ratings
- Post-completed-booking only
- 5-star ratings: overall, WiFi, noise, space quality, staff
- Text review
- Cafe owner can respond
- Aggregate ratings shown on space listings

### Cafe Management
- Space CRUD (photos via Cloudinary, documents via Uploadthing)
- Availability schedules (recurring weekly + blocked dates)
- Earnings dashboard: total revenue, pending payouts, settled
- Review management: view reviews, post responses

## Non-Functional Requirements
- DPDP Act compliance: explicit consent, data minimization, 72hr breach notification
- Phone numbers never exposed cross-role
- Meeting content (title, agenda) encrypted at rest
- Mobile-first design (375px baseline)
- Dark mode support
- TypeScript strict mode (no `any`)
- Server Components by default; Client Components only for interactivity

## Tech Constraints
- No Supabase — use Neon + Clerk + Uploadthing
- No default exports — always named exports
- No hardcoded colors — use Tailwind color tokens
- pnpm as package manager
- Conventional commits (feat:, fix:, chore:)
