'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, LockIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { profileSchema, type ProfileValues } from '@/lib/profile/schemas';
import { initials, type Profile } from '@/lib/profile/user';
import {
  AVATAR_ACCEPT,
  pruneOldAvatars,
  uploadAvatar,
  validateAvatarFile,
} from '@/lib/storage/avatars';
import { useUpdateMeMutation, type UpdateMeRequest } from '@/store/api/profileApi';
import { readApiError } from '@/store/api/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FormMessage } from '@/components/auth/form-parts';

/** A picked file and the blob URL previewing it, so one revoke covers both. */
type StagedImage = { file: File; previewUrl: string };

function AvatarField({
  src,
  fallback,
  busy,
  canRemove,
  onPick,
  onRemove,
}: {
  src: string | null;
  fallback: string;
  busy: boolean;
  canRemove: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      {/* No `size="lg"` — that sets a `data-[size=lg]:size-10` variant class,
          which outranks a plain `size-16` on specificity and wins. */}
      <Avatar className="size-16">
        {src ? <AvatarImage src={src} alt="" /> : null}
        <AvatarFallback className="text-base">{fallback}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon />
            {src ? 'Change photo' : 'Upload photo'}
          </Button>

          {canRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={onRemove}
              className="text-muted-foreground"
            >
              <TrashIcon />
              Remove
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">PNG, JPEG or WebP, up to 2 MB.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so picking the same file twice still fires `change`.
          event.target.value = '';
          if (file) onPick(file);
        }}
      />
    </div>
  );
}

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
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName ?? '' },
  });

  useEffect(() => {
    return () => {
      if (staged) URL.revokeObjectURL(staged.previewUrl);
    };
  }, [staged]);

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
    // Only a saved picture needs clearing server-side; dropping a staged one
    // just puts the saved picture back.
    if (!staged) setRemoved(Boolean(profile.avatarUrl));
    clearStaged();
  }

  function discard() {
    clearStaged();
    setRemoved(false);
    setFormMessage(undefined);
    reset({ fullName: profile.fullName ?? '' });
  }

  const shownAvatar = staged?.previewUrl ?? (removed ? null : profile.avatarUrl);
  const hasChanges = isDirty || staged !== null || removed;

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(undefined);

    const body: UpdateMeRequest = {};
    if (values.fullName !== (profile.fullName ?? '')) body.fullName = values.fullName;

    try {
      if (staged) {
        body.avatarUrl = await uploadAvatar(profile.id, staged.file);
      } else if (removed) {
        body.avatarUrl = null;
      }
    } catch (err) {
      setFormMessage(`Upload failed: ${(err as Error).message}`);
      return;
    }

    try {
      const updated = await updateMe(body).unwrap();

      // Only now the new URL is saved is the old file safe to delete.
      if (body.avatarUrl !== undefined) {
        await pruneOldAvatars(profile.id, updated.avatarUrl);
      }

      clearStaged();
      setRemoved(false);
      reset({ fullName: updated.fullName ?? '' });
      toast.success('Profile updated.');

      // The header and this page are server-rendered from the Supabase session,
      // so they only pick the change up on a refetch.
      router.refresh();
    } catch (err) {
      const { message, fieldErrors } = readApiError(err);
      if (fieldErrors.fullName) setError('fullName', { message: fieldErrors.fullName });
      setFormMessage(fieldErrors.avatarUrl ?? message);
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

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || !hasChanges}>
          {isSubmitting ? <Loader2Icon className="animate-spin" /> : null}
          {isSubmitting ? 'Saving…' : 'Save changes'}
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
