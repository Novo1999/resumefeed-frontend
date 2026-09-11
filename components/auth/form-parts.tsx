'use client';

import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { cn } from 'cn';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** The error replaces the hint rather than stacking below it. */
export function Field({
  name,
  label,
  error,
  hint,
  action,
  children,
}: {
  /** Must match the input's `id`. */
  name: string;
  label: string;
  error?: string;
  hint?: string;
  /** Sits on the label row, e.g. a "Forgot password?" link. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
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
      ) : hint ? (
        <p id={`${name}-message`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({
  children,
  variant = 'error',
  className,
}: {
  children?: React.ReactNode;
  variant?: 'error' | 'info';
  className?: string;
}) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        variant === 'error'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-border bg-muted text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PasswordInput({ className, ...props }: React.ComponentProps<'input'>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('h-10 pr-10', className)}
        {...props}
      />
      <button
        type="button"
        // Keeps Tab running from the field straight to the submit button.
        tabIndex={-1}
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  );
}
