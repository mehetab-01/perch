# Drizzle + Neon Setup for Perch

## Database Connection
```ts
// src/lib/db/index.ts
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

## Schema Pattern
```ts
// src/lib/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, pgEnum, jsonb, real } from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["worker", "cafe_owner", "admin"])
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "checked_in", "completed", "cancelled"])
export const noiseLevelEnum = pgEnum("noise_level", ["quiet", "moderate", "lively"])

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("worker"),
  phone: text("phone"),
  companyName: text("company_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

## Migration Commands
```bash
pnpm drizzle-kit generate  # generates SQL migration
pnpm drizzle-kit migrate   # applies migration to Neon
pnpm drizzle-kit studio    # opens visual DB explorer
```

## drizzle.config.ts
```ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```
