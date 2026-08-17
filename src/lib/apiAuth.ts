import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared guard for REST route handlers (app/api/**). Server Actions get an
 * authenticated session implicitly via the request's cookies; route handlers
 * use the same cookie-based session (createClient() reads it the same way),
 * but we still want an explicit 401 instead of relying solely on RLS
 * silently returning empty results for a logged-out caller.
 */
export async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { supabase, user, unauthorized: null };
}
