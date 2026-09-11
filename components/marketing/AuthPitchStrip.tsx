import { AUTH_PITCH_POINTS } from './AuthPitchPoints';

export function AuthPitchStrip() {
  return (
    <section className="mt-10 flex flex-col gap-3 border-t border-border pt-6 lg:hidden">
      <p className="text-sm font-medium">Why people post here</p>
      <ul className="flex flex-col gap-2.5">
        {AUTH_PITCH_POINTS.map(({ icon: Icon, title }) => (
          <li key={title} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Icon className="size-4 shrink-0 text-foreground/60" />
            {title}
          </li>
        ))}
      </ul>
    </section>
  );
}
