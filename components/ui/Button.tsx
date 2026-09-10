import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-dark hover:bg-gold-light disabled:bg-gold/40 disabled:text-dark/50",
  secondary:
    "border border-gold bg-transparent text-gold hover:bg-gold/10 disabled:opacity-40",
  ghost:
    "bg-transparent text-white hover:bg-white/5 disabled:opacity-40",
  danger:
    "bg-danger text-white hover:bg-danger/90 disabled:opacity-40",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-xs tracking-[0.14em]",
  md: "px-5 py-3 text-xs tracking-[0.16em]",
  lg: "px-7 py-3.5 text-sm tracking-[0.18em]",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 uppercase font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
