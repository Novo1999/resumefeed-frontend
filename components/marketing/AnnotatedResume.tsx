import { StarIcon } from 'lucide-react';

/**
 * The notes quote the line they are about, the way a commenter types it — the
 * feed has comments on a post, not anchored annotations on a page, so nothing
 * here should imply a marker pinned to a line.
 */
const MARGIN_NOTES = [
  {
    reviewer: 'Dana K.',
    initials: 'DK',
    when: '2 hours ago',
    quote: 'Motivated frontend developer seeking a challenging role',
    body: 'Every resume in this feed says motivated. This is your only guaranteed read and it describes the job, not the work.',
    delay: '260ms',
    position: 'lg:absolute lg:-left-8 lg:top-20 lg:w-[17rem]',
  },
  {
    reviewer: 'Marcus D.',
    initials: 'MD',
    when: 'an hour ago',
    quote: 'Worked on the billing team to improve performance',
    body: 'Improved it how much, for how many people? The checkout bullet under this one answers that, so lead with it instead.',
    delay: '460ms',
    position: 'lg:absolute lg:-right-6 lg:top-[19rem] lg:w-[17rem]',
  },
] as const;

function Note({ note }: { note: (typeof MARGIN_NOTES)[number] }) {
  return (
    <figure
      className={`note-in relative rounded-lg border border-border bg-background p-3.5 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.5)] ${note.position}`}
      style={{ animationDelay: note.delay }}
    >
      <figcaption className="mb-2.5 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
          {note.initials}
        </span>
        <span className="text-xs font-medium">{note.reviewer}</span>
        <span className="text-xs text-muted-foreground">{note.when}</span>
      </figcaption>
      <p className="border-l-2 border-note/50 pl-2.5 text-[12px] leading-snug text-muted-foreground">
        “{note.quote}”
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-foreground/85 text-pretty">{note.body}</p>
    </figure>
  );
}

export function AnnotatedResume() {
  return (
    <div className="relative">
      {/* Paper stays white in both themes: the feed renders the PDF itself, which is. */}
      <div className="mx-auto w-full max-w-[27rem] overflow-hidden rounded-md bg-white text-zinc-900 shadow-[0_28px_70px_-32px_rgb(0_0_0/0.55)] ring-1 ring-zinc-900/10">
        <div
          className="px-8 pt-8 pb-16"
          style={{
            maskImage: 'linear-gradient(to bottom, #000 76%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 76%, transparent 100%)',
          }}
        >
          <p className="text-[19px] font-semibold tracking-tight">Priya Raghunathan</p>
          <p className="mt-1 text-[11px] text-zinc-500">
            priya.raghunathan@email.com | Bengaluru | in/priyaraghunathan
          </p>

          <p className="mt-5 border-b border-zinc-200 pb-1 text-[11px] font-semibold text-zinc-700">
            Summary
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-700">
            Motivated frontend developer seeking a challenging role at a fast-growing company where
            I can leverage my skills.
          </p>

          <p className="mt-5 border-b border-zinc-200 pb-1 text-[11px] font-semibold text-zinc-700">
            Experience
          </p>
          <div className="mt-2.5">
            <p className="flex items-baseline justify-between gap-3 text-[12px] font-medium">
              Senior Frontend Developer, Halcyon Pay
              <span className="shrink-0 text-[11px] font-normal text-zinc-500">2023 — now</span>
            </p>
            <ul className="mt-1.5 flex flex-col gap-1.5 text-[12px] leading-relaxed text-zinc-700">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-zinc-400">
                  •
                </span>
                <span>Worked on the billing team to improve performance and fix bugs.</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-zinc-400">
                  •
                </span>
                <span>Rebuilt the checkout flow in React; cut drop-off on the payment step.</span>
              </li>
            </ul>
          </div>
          <div className="mt-3.5">
            <p className="flex items-baseline justify-between gap-3 text-[12px] font-medium">
              Frontend Developer, Nine Yards
              <span className="shrink-0 text-[11px] font-normal text-zinc-500">2021 — 2023</span>
            </p>
            <ul className="mt-1.5 flex flex-col gap-1.5 text-[12px] leading-relaxed text-zinc-700">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-zinc-400">
                  •
                </span>
                <span>Built the internal dashboard the support team uses every day.</span>
              </li>
            </ul>
          </div>

          <p className="mt-5 border-b border-zinc-200 pb-1 text-[11px] font-semibold text-zinc-700">
            Skills
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-700">
            React, TypeScript, Node, Postgres, Playwright
          </p>
        </div>
      </div>

      <div
        className="note-in mt-4 flex w-fit items-center gap-2.5 rounded-full border border-border bg-background py-1.5 pr-4 pl-3 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.5)] lg:absolute lg:bottom-1 lg:left-0 lg:mt-0"
        style={{ animationDelay: '660ms' }}
      >
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={
                star <= 4 ? 'size-3.5 fill-amber-400 text-amber-400' : 'size-3.5 text-border'
              }
            />
          ))}
        </span>
        <span className="text-xs text-muted-foreground">4.0 from 12 ratings, 9 comments</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:mt-0 lg:block">
        {MARGIN_NOTES.map((note) => (
          <Note key={note.reviewer} note={note} />
        ))}
      </div>
    </div>
  );
}
