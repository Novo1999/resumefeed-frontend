'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SmilePlusIcon } from 'lucide-react';
import { REACTION_META } from '@/lib/resume/reaction';
import { REACTION_KINDS, type ReactionKind } from '@/types/resume';

const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 250;

type ReactionPickerProps = {
  value: ReactionKind | null;
  pending: boolean;
  onReact: (kind: ReactionKind | null) => void;
};

/** A tap focuses the trigger as well, so only keyboard focus may open the row. */
function isKeyboardFocus(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  try {
    return target.matches(':focus-visible');
  } catch {
    return false;
  }
}

export function ReactionPicker({ value, pending, onReact }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  // Phones have no hover, so they open the row by tapping the trigger instead.
  const [canHover, setCanHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const scheduleOpen = useCallback(() => {
    cancelPending();
    timerRef.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  }, [cancelPending]);

  // A grace period so the pointer can cross into the popup without it vanishing.
  const scheduleClose = useCallback(() => {
    cancelPending();
    timerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [cancelPending]);

  useEffect(() => cancelPending, [cancelPending]);

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover)');
    const syncCanHover = () => setCanHover(hoverQuery.matches);

    syncCanHover();
    hoverQuery.addEventListener('change', syncCanHover);
    return () => hoverQuery.removeEventListener('change', syncCanHover);
  }, []);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelPending();
        setOpen(false);
      }
    };
    const closeOnOutsideTap = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        cancelPending();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsideTap);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsideTap);
    };
  }, [open, cancelPending]);

  const active = value ? REACTION_META[value] : null;

  const pick = (kind: ReactionKind) => {
    cancelPending();
    setOpen(false);
    onReact(kind === value ? null : kind);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(event) => {
        if (canHover && event.pointerType === 'mouse') scheduleOpen();
      }}
      onPointerLeave={(event) => {
        if (canHover && event.pointerType === 'mouse') scheduleClose();
      }}
      onFocus={(event) => {
        if (!isKeyboardFocus(event.target)) return;
        cancelPending();
        setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          cancelPending();
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          cancelPending();
          setOpen((current) => !current);
        }}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
          active ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        {active ? (
          <>
            <span aria-hidden="true">{active.emoji}</span>
            {active.label}
          </>
        ) : (
          <>
            <SmilePlusIcon className="size-4" />
            React
          </>
        )}
      </button>

      {open ? (
        // The wrapper's padding is a transparent bridge over the gap, so the
        // pointer never leaves the container on its way to the emoji.
        <div className="absolute bottom-full left-0 z-20 pb-2">
          <div
            role="menu"
            aria-label="Pick a reaction"
            className="flex items-center gap-0.5 rounded-full border bg-popover p-1 shadow-lg"
          >
            {REACTION_KINDS.map((kind) => {
              const meta = REACTION_META[kind];
              return (
                <button
                  key={kind}
                  type="button"
                  role="menuitemradio"
                  aria-checked={value === kind}
                  aria-label={value === kind ? `Remove ${meta.label}` : meta.label}
                  title={meta.label}
                  onClick={() => pick(kind)}
                  className={`cursor-pointer rounded-full p-2 text-2xl leading-none transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-1.5 sm:text-xl ${
                    value === kind ? 'bg-muted' : ''
                  }`}
                >
                  <span aria-hidden="true">{meta.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
