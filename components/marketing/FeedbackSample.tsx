import { StarIcon } from 'lucide-react';
import { REACTION_META } from '@/lib/resume/reaction';

const SAMPLE_REACTIONS = [
  { kind: 'like', count: 4 },
  { kind: 'fire', count: 2 },
] as const;

function Author({ initials, name, when }: { initials: string; name: string; when: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {initials}
      </span>
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{when}</span>
    </div>
  );
}

export function FeedbackSample() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-heading text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
              What comes back
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
              Not a score on its own. A rating you can see the reasoning behind, from someone you
              can answer in the thread.
            </p>

            <dl className="mt-8 flex flex-col gap-5 border-t border-border pt-6">
              <div>
                <dt className="text-sm font-medium">Ratings you can interrogate</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  One score per person, changed whenever your next draft earns it. The average sits
                  on the card; the comments underneath explain it.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium">Threads, not a wall of replies</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  Two levels deep, so a follow-up question stays attached to the note it is about.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium">Reactions for the quick read</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  Five of them, one per person, on the resume and on the comments. Enough to back
                  somebody up without writing an essay about it.
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Author initials="PR" name="Priya Raghunathan" when="yesterday" />
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={
                            star <= 4
                              ? 'size-4 fill-amber-400 text-amber-400'
                              : 'size-4 text-muted-foreground/40'
                          }
                        />
                      ))}
                    </span>
                    <span className="text-xs text-muted-foreground">4.0 from 12 ratings</span>
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  Four years frontend, applying to fintech. Is the summary earning its space?
                </p>
              </div>

              <div className="pt-4">
                <Author initials="MD" name="Marcus Delaney" when="2 hours ago" />
                <p className="mt-2.5 text-sm leading-relaxed text-foreground/85 text-pretty">
                  No, cut it. Your checkout bullet is the strongest thing on the page and it is
                  sitting under a line about fixing bugs — swap those two and the first thing anyone
                  reads is a shipped product with a number attached.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {SAMPLE_REACTIONS.map(({ kind, count }) => (
                    <span
                      key={kind}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <span aria-hidden="true">{REACTION_META[kind].emoji}</span>
                      {count}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">1 reply</span>
                </div>

                <div className="mt-4 border-l border-border pl-4">
                  <Author initials="PR" name="Priya Raghunathan" when="an hour ago" />
                  <p className="mt-2.5 text-sm leading-relaxed text-foreground/85 text-pretty">
                    Swapped, and the summary is gone entirely. Posting the new draft tonight if you
                    want to tear into it again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
