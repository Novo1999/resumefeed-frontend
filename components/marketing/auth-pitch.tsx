import { LayersIcon, MessagesSquareIcon, StarIcon } from 'lucide-react';
import { Brand } from '@/components/brand';

const PITCH_POINTS = [
  {
    icon: MessagesSquareIcon,
    title: 'Critique you can act on',
    body: 'Reviewers tell you what to cut, what to lead with, and why it matters for the roles you are actually chasing.',
  },
  {
    icon: StarIcon,
    title: 'Ratings with the reasons attached',
    body: 'Every score arrives with the written feedback that earned it, so you always know what to fix first.',
  },
  {
    icon: LayersIcon,
    title: 'Learn from the whole feed',
    body: 'Read strong resumes in your field and see exactly which lines the community rewarded.',
  },
];

const panelDecoration = (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(255,255,255,0.16), transparent 70%)',
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        WebkitMaskImage:
          'radial-gradient(ellipse 70% 70% at 50% 35%, #000, transparent 75%)',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 35%, #000, transparent 75%)',
      }}
    />
  </div>
);

export function AuthPitchPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-zinc-950 px-12 py-12 text-zinc-50 lg:flex lg:flex-col lg:justify-between">
      {panelDecoration}

      <div className="relative">
        <Brand tone="inverted" />
      </div>

      <div className="relative flex max-w-md flex-col gap-10 py-12">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-4xl leading-tight tracking-tight text-balance">
            Your resume, read by people — not by a keyword filter.
          </h2>
          <p className="text-base leading-relaxed text-zinc-400 text-pretty">
            Post it to the feed and get line-by-line critique, honest ratings, and the
            reasoning behind them, from people building careers in the same field as you.
          </p>
        </div>

        <ul className="flex flex-col gap-6">
          {PITCH_POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <Icon className="size-4" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm leading-relaxed text-zinc-400 text-pretty">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-zinc-500">
        Give a review, get a review. That is the whole deal.
      </p>
    </aside>
  );
}

export function AuthPitchStrip() {
  return (
    <section className="mt-10 flex flex-col gap-3 border-t border-border pt-6 lg:hidden">
      <p className="text-sm font-medium">Why people post here</p>
      <ul className="flex flex-col gap-2.5">
        {PITCH_POINTS.map(({ icon: Icon, title }) => (
          <li key={title} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Icon className="size-4 shrink-0 text-foreground/60" />
            {title}
          </li>
        ))}
      </ul>
    </section>
  );
}
