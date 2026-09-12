import { type ButtonHTMLAttributes } from "react";
import { cls } from "../../lib/cls";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary: "bg-accent text-white hover:bg-accent-hover shadow-md hover:shadow-teal-900/40",
    secondary: "bg-surface text-text hover:bg-surface-hover",
    outline: "border border-border bg-transparent text-text hover:bg-surface-hover",
    ghost: "bg-transparent text-text-secondary hover:bg-surface-hover",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cls(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
