'use client';

import { useRef } from 'react';
import { TrashIcon, UploadIcon } from 'lucide-react';
import { AVATAR_ACCEPT } from '@/lib/storage/avatars';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type AvatarFieldProps = {
  src: string | null;
  fallback: string;
  busy: boolean;
  canRemove: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
};

export function AvatarField({
  src,
  fallback,
  busy,
  canRemove,
  onPick,
  onRemove,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
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
          event.target.value = '';
          if (file) onPick(file);
        }}
      />
    </div>
  );
}
