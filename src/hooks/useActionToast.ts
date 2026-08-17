"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export interface ToastableActionState {
  error?: string;
  message?: string;
}

/**
 * Fires a toast when a useFormState result changes — skips the initial
 * mount value so mounting a form doesn't toast immediately.
 *
 * This captures the initial state object once (via useRef's "only the first
 * call's argument is used" semantics) and compares by reference rather than
 * using a mutable "have we run yet" flag. That distinction matters under
 * React 18 Strict Mode: dev mode intentionally invokes a fresh effect twice
 * on mount (mount -> effect -> fake cleanup -> effect again) with the *same*
 * state reference both times. A mutable ref that flips to false after the
 * first pass would incorrectly treat the second simulated pass as a real
 * state change and fire a toast (and, for useActionSuccess below, close an
 * edit modal) the instant it opens, before any submission happened. Since
 * useFormState always returns a brand-new object from a real dispatch (even
 * a content-identical `{}` on success), reference inequality against the
 * captured initial object reliably means "an action just ran" and is immune
 * to Strict Mode's double-invoke because both simulated passes still see the
 * one unchanged initial reference.
 */
export function useActionToast(state: ToastableActionState, successMessage?: string) {
  const initialState = useRef(state);

  useEffect(() => {
    if (state === initialState.current) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.message) {
      toast.success(state.message);
    } else if (successMessage) {
      toast.success(successMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}

/**
 * Fires a callback once an action completes without error — used to close an
 * edit modal on a successful save. Same reference-identity approach as
 * useActionToast (see comment there), kept as a separate hook since not every
 * useActionToast caller wants an auto-close side effect (e.g. inline create
 * forms that stay open to add another row).
 */
export function useActionSuccess(state: ToastableActionState, onSuccess: () => void) {
  const initialState = useRef(state);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (state === initialState.current) return;
    if (!state.error) onSuccessRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
