"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

type SubmitButtonProps = {
  children: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Working...",
  variant,
  className
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant={variant} className={className}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
