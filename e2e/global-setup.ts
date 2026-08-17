import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { chromium, type FullConfig } from "@playwright/test";
import { createDbPool } from "./db";
import { AUTH_DIR, STORAGE_STATE_PATH, writeTestUser } from "./test-user";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const TEST_EMAIL = `e2e-${Date.now()}@example.test`;
const TEST_PASSWORD = "E2eTestPassword123!";
const TEST_ORG_NAME = "E2E Test Dairy";
const TEST_ADMIN_NAME = "E2E Tester";

export default async function globalSetup(config: FullConfig) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";

  // Create the test user via the Admin API (service role), not the UI signup
  // form. signUp() sends a confirmation email on every call, and repeated
  // test runs (plus manual testing earlier this session) exhausted
  // Supabase's default project email-send rate limit — every subsequent
  // signUp() silently failed with 429 "over_email_send_rate_limit" and never
  // created a user at all. admin.createUser({ email_confirm: true }) creates
  // an already-confirmed user with no email involved, sidestepping that
  // limit entirely. It still fires the same handle_new_user() DB trigger
  // (a plain AFTER INSERT trigger on auth.users, indifferent to which API
  // inserted the row), so the org/profile/seed data are created identically.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { name: TEST_ADMIN_NAME, organization_name: TEST_ORG_NAME },
  });
  if (createError || !created.user) {
    throw new Error(`Failed to create E2E test user via Admin API: ${createError?.message}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Generous timeout: this is the very first navigation of the whole run,
  // often hitting a cold Next.js dev-server compile of "/" plus several
  // Supabase queries (session, profile, org) — 10s was too tight under
  // real-world network/compile latency and caused spurious failures.
  await page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });

  await page.context().storageState({ path: STORAGE_STATE_PATH });
  await browser.close();

  const pool = createDbPool();
  const { rows } = await pool.query(`select organization_id from public.profiles where id = $1`, [
    created.user.id,
  ]);
  await pool.end();

  writeTestUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    orgName: TEST_ORG_NAME,
    authUserId: created.user.id,
    organizationId: rows[0]?.organization_id,
  });
}
