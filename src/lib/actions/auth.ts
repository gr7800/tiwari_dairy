"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error?: string;
  message?: string;
}

export async function signIn(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email address before signing in — check your inbox for the confirmation link." };
    }
    return { error: "Invalid email or password" };
  }
  redirect("/");
}

export async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const organizationName = String(formData.get("organizationName") ?? "").trim();

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, organization_name: organizationName } },
  });
  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, signUp() succeeds but returns no
  // session yet — redirecting to "/" here would just bounce off the
  // middleware's auth guard back to /login. Tell the user what to do instead.
  if (!data.session) {
    return {
      message:
        "Account created — check your email to confirm it before signing in. (If you don't receive an email, disable \"Confirm email\" in Supabase Auth settings, or ask an admin to confirm your account directly.)",
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
