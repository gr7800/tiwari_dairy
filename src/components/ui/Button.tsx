import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-dark hover:shadow-md disabled:opacity-50 disabled:shadow-none",
  secondary:
    "bg-white text-slate-700 border border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:border-slate-500",
  danger:
    "bg-white text-unpaid border border-red-200 shadow-sm hover:bg-red-50 hover:shadow-md dark:bg-slate-800 dark:border-red-900 dark:hover:bg-red-950",
  ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
