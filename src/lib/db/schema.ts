import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  real,
  uuid,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "worker",
  "cafe_owner",
  "admin",
])

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
])

export const noiseLevelEnum = pgEnum("noise_level", [
  "quiet",
  "moderate",
  "lively",
])

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
])

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "captured",
  "failed",
  "refunded",
])

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
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
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const cafes = pgTable("cafes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull().default("Mumbai"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  coverPhotoUrl: text("cover_photo_url"),
  gstNumber: text("gst_number"),
  fssaiLicenseUrl: text("fssai_license_url"),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("pending"),
  avgRating: real("avg_rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  reviewSummary: text("review_summary"),
  reviewSummaryUpdatedAt: timestamp("review_summary_updated_at", {
    withTimezone: true,
  }),
  pricingSuggestionsCache: jsonb("pricing_suggestions_cache").$type<{
    suggestions: {
      timeSlot: string
      currentPrice: number
      suggestedPrice: number
      reason: string
      expectedImpact: string
      spaceId: string
      spaceName: string
    }[]
    generatedAt: string
  }>(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const spaces = pgTable("spaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  cafeId: uuid("cafe_id")
    .notNull()
    .references(() => cafes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  capacityMin: integer("capacity_min").notNull().default(1),
  capacityMax: integer("capacity_max").notNull(),
  pricePerHour: integer("price_per_hour").notNull(), // stored in paise
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  noiseLevel: noiseLevelEnum("noise_level").notNull().default("moderate"),
  photos: text("photos").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const availability = pgTable("availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week"), // 0 = Sunday … 6 = Saturday; null when blockedDate is set
  startTime: text("start_time").notNull(), // format "09:00"
  endTime: text("end_time").notNull(), // format "17:00"
  isRecurring: boolean("is_recurring").notNull().default(true),
  blockedDate: date("blocked_date"), // non-null = one-off block
})

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  workerId: text("worker_id")
    .notNull()
    .references(() => users.id),
  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id),
  cafeId: uuid("cafe_id")
    .notNull()
    .references(() => cafes.id),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  durationHours: real("duration_hours").notNull(),
  numAttendees: integer("num_attendees").notNull().default(1),
  meetingTitle: text("meeting_title"), // encrypted at rest in app layer
  agenda: text("agenda"), // encrypted at rest in app layer
  status: bookingStatusEnum("status").notNull().default("pending"),
  checkinToken: text("checkin_token").unique(),
  totalAmount: integer("total_amount").notNull(), // paise
  platformFee: integer("platform_fee").notNull(), // paise
  cafePayout: integer("cafe_payout").notNull(), // paise
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringGroupId: uuid("recurring_group_id"),
  recurrencePattern: text("recurrence_pattern"), // "weekly" | "biweekly"
  recurrenceEndDate: date("recurrence_end_date"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const bookingInvites = pgTable("booking_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  inviteeEmail: text("invitee_email").notNull(),
  inviteeName: text("invitee_name"),
  status: text("status").notNull().default("pending"), // pending/accepted/declined
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  workerId: text("worker_id")
    .notNull()
    .references(() => users.id),
  cafeId: uuid("cafe_id")
    .notNull()
    .references(() => cafes.id),
  overallRating: integer("overall_rating").notNull(), // 1-5
  wifiRating: integer("wifi_rating"),
  noiseRating: integer("noise_rating"),
  spaceRating: integer("space_rating"),
  staffRating: integer("staff_rating"),
  comment: text("comment"),
  cafeResponse: text("cafe_response"),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  razorpayOrderId: text("razorpay_order_id").notNull(),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  amount: integer("amount").notNull(), // paise
  platformFee: integer("platform_fee").notNull(), // paise
  cafeAmount: integer("cafe_amount").notNull(), // paise
  gstAmount: integer("gst_amount").notNull(), // paise
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  payoutStatus: payoutStatusEnum("payout_status")
    .notNull()
    .default("pending"),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // booking_confirmed, booking_cancelled, review_received, payout_settled, reminder
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, string>>(),
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
  space: one(spaces, {
    fields: [availability.spaceId],
    references: [spaces.id],
  }),
}))

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  worker: one(users, { fields: [bookings.workerId], references: [users.id] }),
  space: one(spaces, { fields: [bookings.spaceId], references: [spaces.id] }),
  cafe: one(cafes, { fields: [bookings.cafeId], references: [cafes.id] }),
  invites: many(bookingInvites),
  review: one(reviews),
  payment: one(payments),
}))

export const bookingInvitesRelations = relations(
  bookingInvites,
  ({ one }) => ({
    booking: one(bookings, {
      fields: [bookingInvites.bookingId],
      references: [bookings.id],
    }),
  })
)

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  worker: one(users, { fields: [reviews.workerId], references: [users.id] }),
  cafe: one(cafes, { fields: [reviews.cafeId], references: [cafes.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
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
