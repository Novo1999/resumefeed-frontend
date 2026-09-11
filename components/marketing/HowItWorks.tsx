const STEPS = [
  {
    title: 'You post the PDF',
    body: 'One upload. The feed renders the first page in place, so people read your resume where they are instead of downloading a stranger’s file.',
  },
  {
    title: 'People mark it up',
    body: 'A rating out of five, a reaction, and comment threads two replies deep. Every score arrives with the writing that earned it, so you know what to fix first.',
  },
  {
    title: 'You read somebody else’s',
    body: 'The same week, with the same honesty you wanted. A feed where everyone only takes feedback runs out of people giving it.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        <h2 className="font-heading text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
          How a post goes
        </h2>

        <ol className="mt-10 max-w-2xl">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-5 pb-9 last:pb-0">
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-4 bottom-0 left-[7px] w-px bg-note/30"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="relative mt-[7px] size-[15px] shrink-0 rounded-full border-[3px] border-note bg-background"
              />
              <div>
                <h3 className="text-base font-medium">{step.title}</h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
