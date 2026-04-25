import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
};

export function FormField({ label, hint, id, className, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor={fieldId}>
      <span>{label}</span>
      <input
        id={fieldId}
        className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        {...props}
      />
      {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}
