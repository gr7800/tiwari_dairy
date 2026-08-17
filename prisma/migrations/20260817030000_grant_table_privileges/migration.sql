-- Fix: "permission denied for table X" for logged-in users.
--
-- RLS policies control WHICH ROWS a role can see/touch, but Postgres checks
-- basic GRANT privileges FIRST — before RLS is even consulted. Supabase
-- normally grants anon/authenticated the needed table privileges
-- automatically when you create tables through its own dashboard/CLI
-- migration flow. Since these tables were created via Prisma connecting
-- directly to Postgres (bypassing that bootstrapping), the grants were
-- never applied, so every request from a logged-in user was rejected
-- before RLS ever got a chance to run.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.organizations,
  public.profiles,
  public.farmers,
  public.milk_types,
  public.shift_configs,
  public.expense_categories,
  public.milk_purchases,
  public.farmer_payments,
  public.milk_supplies,
  public.expenses
to anon, authenticated;

grant execute on function public.current_organization_id() to anon, authenticated;
grant execute on function public.get_farmer_account_totals(uuid, date, date) to anon, authenticated;
grant execute on function public.get_farmer_status_counts() to anon, authenticated;

-- Future-proofing: any table/function this project's migrations create from
-- here on (via the `postgres` role, which is what Prisma always connects as)
-- gets these same grants automatically, so this bug can't recur on the next
-- schema change.
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges for role postgres in schema public
  grant execute on functions to anon, authenticated;
