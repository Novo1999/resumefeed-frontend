const ALTERNATIVES = [
  {
    name: 'A paid resume review',
    cost: 'Roughly $50 to $300',
    verdict: 'One reader, one opinion, and a rewrite in a voice that is not yours.',
  },
  {
    name: 'An ATS score tool',
    cost: 'Free, mostly',
    verdict: 'A number and a keyword list. Nobody has actually read the thing.',
  },
  {
    name: 'Sending it to a friend',
    cost: 'A favour',
    verdict: '"Looks good to me." They like you too much to say the rest.',
  },
] as const;

export function WhatItReplaces() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="font-heading text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
              The other ways to find out
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground text-pretty">
              You already know the resume has a problem. These are the options for finding out what
              it is.
            </p>
          </div>

          <dl className="lg:col-span-8">
            {ALTERNATIVES.map((item) => (
              <div
                key={item.name}
                className="grid gap-1 border-b border-border py-5 sm:grid-cols-[13rem_1fr] sm:gap-6"
              >
                <dt className="text-sm font-medium">
                  {item.name}
                  <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                    {item.cost}
                  </span>
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {item.verdict}
                </dd>
              </div>
            ))}

            <div className="grid gap-1 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="text-sm font-medium">
                Resume Feed
                <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                  Free, reciprocal
                </span>
              </dt>
              <dd className="text-sm leading-relaxed text-pretty">
                Several readers instead of one, each score carrying the written reasoning that
                earned it, and a thread where you can ask what they meant.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
