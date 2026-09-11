import type { ReactNode } from 'react';
import { cn } from 'cn';

type FormMessageProps = {
  children?: ReactNode;
  variant?: 'error' | 'info';
  className?: string;
};

export function FormMessage({ children, variant = 'error', className }: FormMessageProps) {
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
