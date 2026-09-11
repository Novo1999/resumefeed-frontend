import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Field({ name, label, error, hint, action, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={name}>{label}</Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${name}-message`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={`${name}-message`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
