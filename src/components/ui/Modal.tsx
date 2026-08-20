"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Shared edit-dialog shell. Closes on Escape or backdrop click, matching the
 * MobileNav drawer's dismiss conventions so overlay behavior is consistent
 * across the app.
 *
 * Rendered via a portal straight into <body> rather than in place: this
 * component is invoked deep inside page content (e.g. a table row), and
 * page content is wrapped in an animated container (PageTransition). A
 * CSS animation that ends with any `transform` value other than `none`
 * (even a no-op like translateY(0)) makes that ancestor a new containing
 * block for `position: fixed` descendants — so without the portal, this
 * modal would be positioned relative to that (possibly tall, scrolled)
 * wrapper instead of the real viewport, rendering off-screen on long
 * pages. Escaping to <body> sidesteps that regardless of what animations
 * or transforms any future ancestor adds.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 animate-fade-in"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-scale-in dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
