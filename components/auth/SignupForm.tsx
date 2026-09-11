'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, MailCheckIcon } from 'lucide-react';
import { signup } from '@/app/actions/auth';
import { MIN_PASSWORD_LENGTH, signupSchema, type SignupValues } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { ROLE_OPTIONS } from '@/lib/profile/roles';
import { Field } from './Field';
import { FormMessage } from './FormMessage';
import { GoogleAuthButton } from './GoogleAuthButton';
import { PasswordInput } from './PasswordInput';

export function SignupForm() {
  const [formMessage, setFormMessage] = useState<string>();
  const [confirmationEmail, setConfirmationEmail] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', role: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(undefined);

    const result = await signup(values);

    if (result.emailConfirmationSent) {
      setConfirmationEmail(result.email);
      return;
    }

    for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
      setError(field as keyof SignupValues, { message });
    }

    if (result.message) setFormMessage(result.message);
  });

  // Terminal state: the account exists but the email is unconfirmed. Replacing
  // the form makes it obvious the next move is in their inbox, not on this page.
  if (confirmationEmail) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <MailCheckIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-medium">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to{' '}
            <span className="font-medium text-foreground">{confirmationEmail}</span>. Click it to
            finish setting up your account.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormMessage>{formMessage}</FormMessage>

      <Field name="fullName" label="Name" error={errors.fullName?.message}>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Ada Lovelace"
          className="h-10"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? 'fullName-message' : undefined}
          disabled={isSubmitting}
          {...register('fullName')}
        />
      </Field>

      <Field
        name="role"
        label="Role"
        hint="Choose a suggested role or type your own."
        error={errors.role?.message}
      >
        <Combobox
          id="role"
          value={watch('role')}
          onValueChange={(role) => setValue('role', role, { shouldDirty: true, shouldValidate: true })}
          options={ROLE_OPTIONS}
          placeholder="e.g. Software Engineer"
          disabled={isSubmitting}
        />
      </Field>

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

      <Field
        name="password"
        label="Password"
        error={errors.password?.message}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby="password-message"
          disabled={isSubmitting}
          {...register('password')}
        />
      </Field>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? <Loader2Icon className="animate-spin" /> : null}
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>

      <div className="relative flex items-center py-1" aria-hidden="true">
        <div className="grow border-t" />
        <span className="px-3 text-xs text-muted-foreground">or</span>
        <div className="grow border-t" />
      </div>

      <GoogleAuthButton disabled={isSubmitting} onError={setFormMessage} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
