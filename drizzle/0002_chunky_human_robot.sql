ALTER TABLE "bookings" ADD COLUMN "is_recurring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "recurring_group_id" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "recurrence_pattern" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "recurrence_end_date" date;