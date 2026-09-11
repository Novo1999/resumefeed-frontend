'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, LockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/auth/Field';
import { FormMessage } from '@/components/auth/FormMessage';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileSchema, type ProfileValues } from '@/lib/profile/schemas';
import { ROLE_OPTIONS } from '@/lib/profile/roles';
import { initials, type Profile } from '@/lib/profile/user';
import { pruneOldAvatars, uploadAvatar, validateAvatarFile } from '@/lib/storage/avatars';
import { readApiError } from '@/store/api/errors';
import { useUpdateMeMutation, type UpdateMeRequest } from '@/store/api/profileApi';
import { AvatarField } from './AvatarField';

type StagedImage = { file: File; previewUrl: string };

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [updateMe] = useUpdateMeMutation();
  const [staged, setStaged] = useState<StagedImage | null>(null);
  const [removed, setRemoved] = useState(false);
  const [formMessage, setFormMessage] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName ?? '', role: profile.role ?? '' },
  });

  useEffect(
    () => () => {
      if (staged) URL.revokeObjectURL(staged.previewUrl);
    },
    [staged],
  );

  function clearStaged() {
    setStaged((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }

  function stage(file: File) {
    const problem = validateAvatarFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setFormMessage(undefined);
    setRemoved(false);
    setStaged((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
  }

  function remove() {
    if (!staged) setRemoved(Boolean(profile.avatarUrl));
    clearStaged();
  }

  function discard() {
    clearStaged();
    setRemoved(false);
    setFormMessage(undefined);
    reset({ fullName: profile.fullName ?? '', role: profile.role ?? '' });
  }

  const shownAvatar = staged?.previewUrl ?? (removed ? null : profile.avatarUrl);
  const hasChanges = isDirty || staged !== null || removed;
  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(undefined);
    const body: UpdateMeRequest = {};
    if (values.fullName !== (profile.fullName ?? '')) body.fullName = values.fullName;
    if (values.role !== (profile.role ?? '')) body.role = values.role.trim() || null;

    try {
      if (staged) body.avatarUrl = await uploadAvatar(profile.id, staged.file);
      else if (removed) body.avatarUrl = null;
    } catch (error) {
      setFormMessage(`Upload failed: ${(error as Error).message}`);
      return;
    }

    try {
      const updated = await updateMe(body).unwrap();
      if (body.avatarUrl !== undefined) await pruneOldAvatars(profile.id, updated.avatarUrl);
      clearStaged();
      setRemoved(false);
      reset({ fullName: updated.fullName ?? '', role: updated.role ?? '' });
      toast.success('Profile updated.');
      router.refresh();
    } catch (error) {
      const { message, fieldErrors } = readApiError(error);
      if (fieldErrors.fullName) setError('fullName', { message: fieldErrors.fullName });
      if (fieldErrors.role) setError('role', { message: fieldErrors.role });
      setFormMessage(fieldErrors.avatarUrl ?? fieldErrors.role ?? message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <FormMessage>{formMessage}</FormMessage>
      <div className="flex flex-col gap-2">
        <Label>Profile picture</Label>
        <AvatarField
          src={shownAvatar}
          fallback={initials(profile.fullName, profile.email)}
          busy={isSubmitting}
          canRemove={Boolean(shownAvatar)}
          onPick={stage}
          onRemove={remove}
        />
      </div>
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
        name="email"
        label="Email"
        hint="Your email is how you sign in, so it cannot be changed here."
      >
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={profile.email}
            readOnly
            disabled
            aria-describedby="email-message"
            className="h-10 pr-10"
          />
          <LockIcon className="pointer-events-none absolute inset-y-0 right-3 my-auto size-3.5 text-muted-foreground" />
        </div>
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
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || !hasChanges}>
          {isSubmitting ? <Loader2Icon className="animate-spin" /> : null}
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
        {hasChanges && !isSubmitting ? (
          <Button type="button" variant="ghost" onClick={discard}>
            Discard
          </Button>
        ) : null}
      </div>
    </form>
  );
}
