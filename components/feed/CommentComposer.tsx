'use client';

import { useRef, useState } from 'react';
import { SendHorizontalIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { COMMENT_BODY_MAX_LENGTH } from '@/types/comment';

/** Room to warn before the server rejects the body outright. */
const COUNTER_VISIBLE_FROM = COMMENT_BODY_MAX_LENGTH - 200;

type CommentComposerProps = {
  onSubmit: (body: string) => Promise<boolean>;
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
};

/** The one text box behind writing a comment, replying, and editing. */
export function CommentComposer({
  onSubmit,
  placeholder,
  submitLabel,
  initialValue = '',
  autoFocus = false,
  onCancel,
}: CommentComposerProps) {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const tooLong = trimmed.length > COMMENT_BODY_MAX_LENGTH;
  const canSubmit = trimmed.length > 0 && !tooLong && !pending;

  async function submit() {
    if (!canSubmit) return;
    setPending(true);
    try {
      // Only clear on success, so a failed post does not lose what was typed.
      if (await onSubmit(trimmed)) setValue('');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends. Shift+Enter keeps the newline, and a composing IME is
          // left alone — Enter there is choosing a candidate, not posting.
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void submit();
          }
          if (event.key === 'Escape' && onCancel) onCancel();
        }}
        placeholder={placeholder}
        disabled={pending}
        aria-invalid={tooLong || undefined}
        aria-label={placeholder}
        aria-describedby={`${submitLabel}-hint`}
        className="min-h-16 text-sm"
      />
      <div className="flex items-center gap-2">
        {trimmed.length >= COUNTER_VISIBLE_FROM ? (
          <span
            className={`text-xs ${tooLong ? 'text-destructive' : 'text-muted-foreground'}`}
            role={tooLong ? 'alert' : undefined}
          >
            {trimmed.length} / {COMMENT_BODY_MAX_LENGTH}
          </span>
        ) : (
          <span id={`${submitLabel}-hint`} className="text-xs text-muted-foreground">
            Enter to send, Shift+Enter for a new line
          </span>
        )}
        <div className="ms-auto flex items-center gap-2">
          {onCancel ? (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
              <XIcon />
              Cancel
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={() => void submit()} disabled={!canSubmit}>
            <SendHorizontalIcon />
            {pending ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
