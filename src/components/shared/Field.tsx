import { type ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function Field({ label, children, className = "" }: FieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-[11px] font-medium tracking-[0.04em] text-[var(--text-secondary)] uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
