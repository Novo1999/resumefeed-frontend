import { AnnotatedResume } from './AnnotatedResume';
import { LandingCta } from './LandingCta';

export function LandingHero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-14 pb-20 sm:pt-20 lg:pb-28">
      <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h1 className="font-heading text-[2.75rem] leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Somebody has to tell you the third bullet isn&rsquo;t working.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
            Post your resume to the feed and people read the whole page: a rating out of five, the
            lines that aren&rsquo;t landing quoted back at you, and what they would write instead.
          </p>

          <div className="mt-8">
            <LandingCta signedIn={signedIn} />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Free. It works if you review somebody else&rsquo;s while you wait for yours.
          </p>
        </div>

        <div className="lg:col-span-7 lg:pl-6">
          <AnnotatedResume />
        </div>
      </div>
    </section>
  );
}
