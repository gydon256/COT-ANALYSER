import { clsx } from "clsx";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-teal-700 text-white hover:bg-teal-800 focus-visible:outline-teal-700",
  secondary:
    "border border-slate-300 bg-[var(--panel-2)] text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-500",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-slate-500",
  danger: "bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700"
};

const baseClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={clsx(baseClass, variants[variant], className)} {...props} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
};

export function ButtonLink({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={clsx(baseClass, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
