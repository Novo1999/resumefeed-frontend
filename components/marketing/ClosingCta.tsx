import { LandingCta } from './LandingCta';

export function ClosingCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-24">
        <div className="max-w-2xl">
          <h2 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
            Post the version you were about to send anyway.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground text-pretty">
            The worst thing that happens is a room full of strangers telling you it is already good.
          </p>
          <div className="mt-8">
            <LandingCta signedIn={signedIn} />
          </div>
        </div>
      </div>
    </section>
  );
}
