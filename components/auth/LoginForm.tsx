'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { login } from '@/app/actions/auth';
import { loginSchema, type LoginValues } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from './Field';
import { FormMessage } from './FormMessage';
import { PasswordInput } from './PasswordInput';

export function LoginForm({ next }: { next?: string }) {
  const [formMessage, setFormMessage] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(undefined);

    // On success the action redirects, which throws — so reaching the next line
    // at all means the sign-in was refused.
    const result = await login(values, next);

    for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
      // The schema also covers signup's fields; ignore any that aren't ours.
      if (field === 'email' || field === 'password') {
        setError(field, { message });
      }
    }

    if (result.message) setFormMessage(result.message);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormMessage>{formMessage}</FormMessage>

      <Field name="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="h-10"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-message' : undefined}
          disabled={isSubmitting}
          {...register('email')}
        />
      </Field>

      <Field name="password" label="Password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-message' : undefined}
          disabled={isSubmitting}
          {...register('password')}
        />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? <Loader2Icon className="animate-spin" /> : null}
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
