import {
  pgTable,
  pgEnum,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  time,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "worker",
  "cafe_owner",
  "admin",
])

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "under_review",
  "verified",
  "rejected",
])

export const noiseLevelEnum = pgEnum("noise_level", [
  "silent",
  "quiet",
  "moderate",
  "lively",
])

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
])

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "declined",
])

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "captured",
  "failed",
  "refunded",
])

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "settled",
  "failed",
])

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("worker"),
  phone: text("phone"),
  companyName: text("company_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const cafes = pgTable("cafes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  address: text("address").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  gstNumber: text("gst_number"),
  fssaiLicenseUrl: text("fssai_license_url"),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("pending"),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const spaces = pgTable("spaces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  cafeId: text("cafe_id")
    .notNull()
    .references(() => cafes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  capacityMin: integer("capacity_min").notNull().default(1),
  capacityMax: integer("capacity_max").notNull(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  noiseLevel: noiseLevelEnum("noise_level").notNull().default("moderate"),
  photos: text("photos").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const availability = pgTable("availability", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  spaceId: text("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week"), // 0 = Sunday … 6 = Saturday; null when blockedDate is set
  startTime: time("start_time"),
  endTime: time("end_time"),
  isRecurring: boolean("is_recurring").notNull().default(true),
  blockedDate: date("blocked_date"), // non-null = one-off block
})

export const bookings = pgTable("bookings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workerId: text("worker_id")
    .notNull()
    .references(() => users.id),
  spaceId: text("space_id")
    .notNull()
    .references(() => spaces.id),
  cafeId: text("cafe_id")
    .notNull()
    .references(() => cafes.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  durationHours: decimal("duration_hours", { precision: 4, scale: 2 }).notNull(),
  numAttendees: integer("num_attendees").notNull().default(1),
  meetingTitle: text("meeting_title"), // encrypted at rest in app layer
  agenda: text("agenda"),             // encrypted at rest in app layer
  status: bookingStatusEnum("status").notNull().default("pending"),
  checkinToken: text("checkin_token").unique(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  cafePayout: decimal("cafe_payout", { precision: 10, scale: 2 }).notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const bookingInvites = pgTable("booking_invites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  inviteeEmail: text("invitee_email").notNull(),
  status: inviteStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const reviews = pgTable("reviews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  workerId: text("worker_id")
    .notNull()
    .references(() => users.id),
  cafeId: text("cafe_id")
    .notNull()
    .references(() => cafes.id),
  overallRating: integer("overall_rating").notNull(),  // 1-5
  wifiRating: integer("wifi_rating"),
  noiseRating: integer("noise_rating"),
  spaceRating: integer("space_rating"),
  staffRating: integer("staff_rating"),
  text: text("text"),
  cafeResponse: text("cafe_response"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  razorpayTxnId: text("razorpay_txn_id").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  cafeAmount: decimal("cafe_amount", { precision: 10, scale: 2 }).notNull(),
  gst: decimal("gst", { precision: 10, scale: 2 }).notNull().default("0.00"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  payoutStatus: payoutStatusEnum("payout_status").notNull().default("pending"),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  cafes: many(cafes),
  bookings: many(bookings),
  reviews: many(reviews),
  notifications: many(notifications),
}))

export const cafesRelations = relations(cafes, ({ one, many }) => ({
  owner: one(users, { fields: [cafes.ownerId], references: [users.id] }),
  spaces: many(spaces),
  bookings: many(bookings),
  reviews: many(reviews),
}))

export const spacesRelations = relations(spaces, ({ one, many }) => ({
  cafe: one(cafes, { fields: [spaces.cafeId], references: [cafes.id] }),
  availability: many(availability),
  bookings: many(bookings),
}))

export const availabilityRelations = relations(availability, ({ one }) => ({
  space: one(spaces, { fields: [availability.spaceId], references: [spaces.id] }),
}))

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  worker: one(users, { fields: [bookings.workerId], references: [users.id] }),
  space: one(spaces, { fields: [bookings.spaceId], references: [spaces.id] }),
  cafe: one(cafes, { fields: [bookings.cafeId], references: [cafes.id] }),
  invites: many(bookingInvites),
  review: one(reviews),
  payment: one(payments),
}))

export const bookingInvitesRelations = relations(bookingInvites, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingInvites.bookingId],
    references: [bookings.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
  worker: one(users, { fields: [reviews.workerId], references: [users.id] }),
  cafe: one(cafes, { fields: [reviews.cafeId], references: [cafes.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}))

// ─── Inferred types ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Cafe = typeof cafes.$inferSelect
export type NewCafe = typeof cafes.$inferInsert

export type Space = typeof spaces.$inferSelect
export type NewSpace = typeof spaces.$inferInsert

export type Availability = typeof availability.$inferSelect
export type NewAvailability = typeof availability.$inferInsert

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert

export type BookingInvite = typeof bookingInvites.$inferSelect
export type NewBookingInvite = typeof bookingInvites.$inferInsert

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
