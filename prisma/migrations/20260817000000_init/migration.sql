-- Tiwari Dairy — initial schema (Prisma-managed) + Supabase-specific
-- RLS/functions/triggers (raw SQL, appended below — Prisma's schema
-- language can't express any of that, see the note at the top of
-- prisma/schema.prisma).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'OTHER');

-- Tables
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "farmers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "farmer_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "milk_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "milk_types_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shift_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shift_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expense_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- rule #18: both calculated_amount and total_amount are kept, plus
-- is_amount_overridden, so a manual override remains auditable.
CREATE TABLE "milk_purchases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "farmer_id" UUID NOT NULL,
    "purchase_date" DATE NOT NULL,
    "shift_id" UUID NOT NULL,
    "milk_type_id" UUID NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "fat_percentage" DECIMAL(5,2),
    "snf_percentage" DECIMAL(5,2),
    "rate" DECIMAL(10,2) NOT NULL,
    "calculated_amount" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "is_amount_overridden" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "milk_purchases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "farmer_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "farmer_id" UUID NOT NULL,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "reference_number" TEXT,
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "farmer_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "milk_supplies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "supply_date" DATE NOT NULL,
    "shift_id" UUID NOT NULL,
    "milk_type_id" UUID NOT NULL,
    "customer_name" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "fat_percentage" DECIMAL(5,2),
    "snf_percentage" DECIMAL(5,2),
    "rate" DECIMAL(10,2) NOT NULL,
    "calculated_amount" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "is_amount_overridden" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "milk_supplies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "expense_date" DATE NOT NULL,
    "category_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- Unique constraints & indexes
-- (profiles has no organization_id uniqueness — an organization can have
-- multiple staff profiles; only farmer_code, milk type name, shift name,
-- and expense category name are unique per organization.)
CREATE UNIQUE INDEX "farmers_organization_id_farmer_code_key" ON "farmers"("organization_id", "farmer_code");
CREATE UNIQUE INDEX "milk_types_organization_id_name_key" ON "milk_types"("organization_id", "name");
CREATE UNIQUE INDEX "shift_configs_organization_id_name_key" ON "shift_configs"("organization_id", "name");
CREATE UNIQUE INDEX "expense_categories_organization_id_name_key" ON "expense_categories"("organization_id", "name");
-- rule #20: the one duplicate a farmer CAN'T create twice, enforced at the DB level.
CREATE UNIQUE INDEX "milk_purchases_org_farmer_date_shift_milktype_key"
    ON "milk_purchases"("organization_id", "farmer_id", "purchase_date", "shift_id", "milk_type_id");
CREATE INDEX "milk_purchases_organization_id_farmer_id_idx" ON "milk_purchases"("organization_id", "farmer_id");
CREATE INDEX "farmer_payments_organization_id_farmer_id_idx" ON "farmer_payments"("organization_id", "farmer_id");
CREATE INDEX "milk_supplies_organization_id_supply_date_idx" ON "milk_supplies"("organization_id", "supply_date");
CREATE INDEX "expenses_organization_id_expense_date_idx" ON "expenses"("organization_id", "expense_date");

-- Foreign keys within the public schema
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "milk_types" ADD CONSTRAINT "milk_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shift_configs" ADD CONSTRAINT "shift_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "milk_purchases" ADD CONSTRAINT "milk_purchases_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "milk_purchases" ADD CONSTRAINT "milk_purchases_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "milk_purchases" ADD CONSTRAINT "milk_purchases_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shift_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "milk_purchases" ADD CONSTRAINT "milk_purchases_milk_type_id_fkey" FOREIGN KEY ("milk_type_id") REFERENCES "milk_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "farmer_payments" ADD CONSTRAINT "farmer_payments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farmer_payments" ADD CONSTRAINT "farmer_payments_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "milk_supplies" ADD CONSTRAINT "milk_supplies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "milk_supplies" ADD CONSTRAINT "milk_supplies_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shift_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "milk_supplies" ADD CONSTRAINT "milk_supplies_milk_type_id_fkey" FOREIGN KEY ("milk_type_id") REFERENCES "milk_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- profiles.id is a Supabase Auth user id — Prisma doesn't model the `auth`
-- schema here (see prisma/schema.prisma), so this FK is added by hand.
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- ===========================================================================
-- Everything below this line is Supabase-specific (RLS, helper functions,
-- the new-user provisioning trigger) and has no Prisma schema.prisma
-- representation — Prisma just replays it as opaque SQL. Do not run
-- `prisma db pull` and let it blow these away; they won't show up in
-- introspection as anything schema.prisma understands, and that's expected.
-- ===========================================================================

-- updated_at helper (Prisma's @updatedAt only updates via Prisma Client,
-- which we don't use at runtime — so we need this trigger instead).
CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.farmers FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.milk_types FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.shift_configs FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.expense_categories FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.milk_purchases FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.farmer_payments FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.milk_supplies FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Looks up the current user's organization. SECURITY DEFINER + a fixed
-- search_path so it bypasses RLS on `profiles` internally (avoiding
-- recursive-policy issues) while still only ever returning the caller's own org.
CREATE FUNCTION public.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Now that current_organization_id() exists, every org-scoped table can
-- default organization_id to it — app code never looks up or passes the
-- caller's org on insert; the RLS WITH CHECK clause confirms it can't be
-- spoofed to a different org.
ALTER TABLE public.farmers ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();
ALTER TABLE public.milk_types ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();
ALTER TABLE public.shift_configs ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();
ALTER TABLE public.expense_categories ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();
ALTER TABLE public.milk_purchases ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();
ALTER TABLE public.farmer_payments ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();
ALTER TABLE public.milk_supplies ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();
ALTER TABLE public.expenses ALTER COLUMN organization_id SET DEFAULT public.current_organization_id();

-- Auto-provisions a brand new organization (with seeded master data) for
-- every new Supabase Auth user. Sign up -> new org -> seeded milk types /
-- shifts / expense categories, isolated by RLS from everyone else — this is
-- what makes onboarding a second dairy business later a zero-migration
-- operation.
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(NEW.raw_user_meta_data ->> 'organization_name', 'My Dairy'))
  RETURNING id INTO new_org_id;

  INSERT INTO public.profiles (id, organization_id, name, role)
  VALUES (NEW.id, new_org_id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), 'ADMIN');

  INSERT INTO public.milk_types (organization_id, name) VALUES
    (new_org_id, 'Cow Milk'),
    (new_org_id, 'Buffalo Milk'),
    (new_org_id, 'Mixed Milk');

  INSERT INTO public.shift_configs (organization_id, name, start_time, end_time, sort_order) VALUES
    (new_org_id, 'Morning', '04:00', '12:00', 0),
    (new_org_id, 'Evening', '12:00', '22:00', 1);

  INSERT INTO public.expense_categories (organization_id, name) VALUES
    (new_org_id, 'Transport'),
    (new_org_id, 'Electricity'),
    (new_org_id, 'Maintenance'),
    (new_org_id, 'Salary'),
    (new_org_id, 'Other');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- get_farmer_account_totals — the one aggregate the app needs on the hot
-- path (ledger + dashboard), computed in SQL rather than pulled row-by-row
-- into Node. Classification into PAID/PARTIALLY_PAID/UNPAID/advance (rules
-- #7/#8) stays in TypeScript (src/lib/ledger.ts) so that threshold logic is
-- tested in one place and reusable for client-side previews.
CREATE FUNCTION public.get_farmer_account_totals(p_farmer_id uuid, p_from date, p_to date)
RETURNS TABLE (total_milk_value numeric, total_paid numeric)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE((
      SELECT sum(total_amount) FROM public.milk_purchases
      WHERE farmer_id = p_farmer_id
        AND organization_id = public.current_organization_id()
        AND (p_from IS NULL OR purchase_date >= p_from)
        AND (p_to IS NULL OR purchase_date <= p_to)
    ), 0) AS total_milk_value,
    COALESCE((
      SELECT sum(amount) FROM public.farmer_payments
      WHERE farmer_id = p_farmer_id
        AND organization_id = public.current_organization_id()
        AND (p_from IS NULL OR payment_date >= p_from)
        AND (p_to IS NULL OR payment_date <= p_to)
    ), 0) AS total_paid;
$$;

-- Farmer PAID/PARTIALLY_PAID/UNPAID counts for the dashboard (rule #21's
-- "who is Paid / Partially Paid / Unpaid"). Grouping happens in SQL rather
-- than pulling every farmer's transactions into Node — the status thresholds
-- mirror src/lib/ledger.ts's buildAccountSummary() intentionally, since a
-- farmer's status is always independent of any dashboard date filter.
CREATE FUNCTION public.get_farmer_status_counts()
RETURNS TABLE (status text, count bigint)
LANGUAGE sql
STABLE
AS $$
  WITH totals AS (
    SELECT
      f.id AS farmer_id,
      COALESCE((
        SELECT sum(total_amount) FROM public.milk_purchases mp
        WHERE mp.farmer_id = f.id AND mp.organization_id = public.current_organization_id()
      ), 0) AS milk_value,
      COALESCE((
        SELECT sum(amount) FROM public.farmer_payments fp
        WHERE fp.farmer_id = f.id AND fp.organization_id = public.current_organization_id()
      ), 0) AS paid
    FROM public.farmers f
    WHERE f.organization_id = public.current_organization_id()
  )
  SELECT
    CASE
      WHEN paid <= 0 THEN 'UNPAID'
      WHEN paid < milk_value THEN 'PARTIALLY_PAID'
      ELSE 'PAID'
    END AS status,
    count(*) AS count
  FROM totals
  GROUP BY 1;
$$;

-- Row Level Security — one consistent pattern applied to every org-scoped
-- table: readable/writable only within the caller's own organization.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON public.organizations FOR SELECT
  USING (id = public.current_organization_id());
CREATE POLICY "org_update" ON public.organizations FOR UPDATE
  USING (id = public.current_organization_id());

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (organization_id = public.current_organization_id());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "farmers_all" ON public.farmers FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY "milk_types_all" ON public.milk_types FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY "shift_configs_all" ON public.shift_configs FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY "expense_categories_all" ON public.expense_categories FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY "milk_purchases_all" ON public.milk_purchases FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY "farmer_payments_all" ON public.farmer_payments FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY "milk_supplies_all" ON public.milk_supplies FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());

CREATE POLICY "expenses_all" ON public.expenses FOR ALL
  USING (organization_id = public.current_organization_id())
  WITH CHECK (organization_id = public.current_organization_id());
