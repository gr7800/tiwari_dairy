"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, type AuthActionState } from "@/lib/actions/auth";
import { useActionToast } from "@/hooks/useActionToast";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/Field";

const initialState: AuthActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [signInState, signInAction] = useFormState(signIn, initialState);
  const [signUpState, signUpAction] = useFormState(signUp, initialState);
  // Sign-in success redirects away (no state to react to), so only its error
  // needs a toast. Sign-up's success message is long, instructional text
  // (what to do about email confirmation) that stays inline for the user to
  // read at leisure — the toast only echoes a short confirmation alongside it.
  useActionToast(signInState);
  useActionToast({ error: signUpState.error }, signUpState.message ? "Account created" : undefined);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
      <div className="h-1.5 bg-gradient-to-r from-gold via-amber-300 to-gold" aria-hidden="true" />

      <div className="p-7 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light font-heading text-2xl font-bold text-accent ring-1 ring-gold/40">
            T
          </span>
          <h1 className="font-heading text-2xl font-semibold text-slate-900 dark:text-slate-100">Tiwari Dairy</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {mode === "sign-in" ? "Sign in to your dairy account" : "Set up a new dairy account"}
          </p>
        </div>

        {mode === "sign-in" ? (
          <form action={signInAction} className="space-y-4">
            <FieldGroup label="Email">
              <Input type="email" name="email" required autoFocus />
            </FieldGroup>
            <FieldGroup label="Password">
              <Input type="password" name="password" required />
            </FieldGroup>
            <SubmitButton label="Sign in" />
          </form>
        ) : (
          <form action={signUpAction} className="space-y-4">
            <FieldGroup label="Dairy / Business name">
              <Input type="text" name="organizationName" required autoFocus placeholder="e.g. Tiwari Dairy" />
            </FieldGroup>
            <FieldGroup label="Your name">
              <Input type="text" name="name" required />
            </FieldGroup>
            <FieldGroup label="Email">
              <Input type="email" name="email" required />
            </FieldGroup>
            <FieldGroup label="Password" hint={<span className="text-xs text-slate-400 dark:text-slate-500">min 8 characters</span>}>
              <Input type="password" name="password" required minLength={8} />
            </FieldGroup>
            {signUpState?.message && <p className="text-sm text-paid">{signUpState.message}</p>}
            <SubmitButton label="Create account" />
          </form>
        )}

        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-5 w-full text-center text-sm text-accent hover:underline"
        >
          {mode === "sign-in" ? "New dairy business? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
