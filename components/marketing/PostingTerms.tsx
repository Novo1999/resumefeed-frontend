const TERMS = [
  {
    title: 'Your file is not loose on the internet',
    body: 'The PDF sits in private storage. The feed hands it to signed-in readers through a link that expires after ten minutes, and there is no permanent URL to pass around.',
  },
  {
    title: 'You can delete any comment on your own post',
    body: 'Quietly, without giving a reason. It is your name and your phone number on that page, so the last word about what stays under it is yours.',
  },
  {
    title: 'Nothing pings you when a review lands',
    body: 'There are no notifications yet. Check back on your post the way you would check a thread you started — the comments will be sitting there.',
  },
  {
    title: 'Take the contact block out first',
    body: 'Nobody reviewing your layout needs your street address. Black it out before you upload — the feedback on everything else is exactly the same.',
  },
] as const;

export function PostingTerms() {
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="font-heading text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
              Before you post it
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground text-pretty">
              Putting your resume in front of strangers is a real thing to ask. Here is exactly what
              you are agreeing to.
            </p>
          </div>

          <div className="flex flex-col gap-7 lg:col-span-8">
            {TERMS.map((term) => (
              <div key={term.title} className="border-l-2 border-note/40 pl-5">
                <h3 className="text-base font-medium">{term.title}</h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
                  {term.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
