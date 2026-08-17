-- Fix: every table's updated_at column was NOT NULL with no default. Prisma's
-- @updatedAt is normally managed by Prisma Client on every write, but this
-- project doesn't use Prisma Client at runtime (see prisma/schema.prisma) —
-- so nothing was ever setting updated_at, and EVERY insert anywhere in the
-- app (including the handle_new_user() signup trigger) failed its NOT NULL
-- constraint. This adds a DB-level default so inserts work without the app
-- having to set it explicitly.

ALTER TABLE "organizations" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "farmers" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "milk_types" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "shift_configs" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "expense_categories" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "milk_purchases" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "farmer_payments" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "milk_supplies" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "expenses" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
