import { createDbPool } from "./db";
import { readTestUser } from "./test-user";

export default async function globalTeardown() {
  let user;
  try {
    user = readTestUser();
  } catch {
    return; // global-setup never got far enough to write it — nothing to clean up
  }

  const pool = createDbPool();
  try {
    // Deleting the organization cascades to every table that has
    // organization_id FK'd to it (farmers, purchases, payments, supplies,
    // expenses, milk_types, shift_configs, expense_categories, profiles) —
    // one delete cleans up everything the test session created.
    if (user.organizationId) {
      await pool.query(`delete from public.organizations where id = $1`, [user.organizationId]);
    }
    // auth.users isn't cascaded FROM organizations (the FK points the other
    // way), so it needs its own delete.
    if (user.authUserId) {
      await pool.query(`delete from auth.users where id = $1`, [user.authUserId]);
    }
  } finally {
    await pool.end();
  }
}
