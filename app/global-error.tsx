'use client'; // Error boundaries must be Client Components.

/**
 * Last resort: a throw from the root layout itself — `SiteHeader` awaits
 * Supabase there — or from `app/error.tsx` while it renders.
 *
 * This file *replaces* the root layout, so it owns the whole document and
 * deliberately depends on nothing: no `globals.css`, no `next/font`, no UI
 * components. Tailwind's `--font-sans` resolves through `--font-geist-sans`,
 * and the layout that defined that variable is exactly the thing that just
 * failed — importing the stylesheet here would leave every utility pointing at
 * a variable that no longer exists. Inline styles still render when the CSS
 * pipeline is what broke.
 *
 * The colours mirror the light/dark tokens in `globals.css`. They follow the OS
 * scheme rather than the app's `.dark` class, which lives on the replaced tree.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {/* No `metadata` export from a Client Component; React hoists this. */}
        <title>Something went wrong — Resume Feed</title>

        <style>{`
          .ge {
            --ge-bg: #ffffff; --ge-fg: #171717; --ge-muted: #737373;
            --ge-card: #ffffff; --ge-border: #e5e5e5;
            --ge-accent: #303030; --ge-accent-fg: #fafafa;
          }
          @media (prefers-color-scheme: dark) {
            .ge {
              --ge-bg: #171717; --ge-fg: #fafafa; --ge-muted: #a1a1a1;
              --ge-card: #303030; --ge-border: #ffffff1a;
              --ge-accent: #ededed; --ge-accent-fg: #303030;
            }
          }
          .ge-button:hover { opacity: 0.85; }
          .ge-button:focus-visible { outline: 2px solid var(--ge-muted); outline-offset: 2px; }
        `}</style>

        <div
          className="ge"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'var(--ge-bg)',
            color: 'var(--ge-fg)',
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          }}
        >
          <main
            style={{
              width: '100%',
              maxWidth: '24rem',
              background: 'var(--ge-card)',
              border: '1px solid var(--ge-border)',
              borderRadius: '0.625rem',
              padding: '1.75rem',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                margin: '0 0 0.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                margin: '0 0 1.5rem',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--ge-muted)',
              }}
            >
              Resume Feed failed to load. Trying again often clears it.
            </p>

            <button
              type="button"
              className="ge-button"
              onClick={() => retry()}
              style={{
                width: '100%',
                height: '2.25rem',
                border: 0,
                borderRadius: '0.5rem',
                background: 'var(--ge-accent)',
                color: 'var(--ge-accent-fg)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>

            {error.digest ? (
              <p
                style={{
                  margin: '1rem 0 0',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.75rem',
                  color: 'var(--ge-muted)',
                }}
              >
                {error.digest}
              </p>
            ) : null}
          </main>
        </div>
      </body>
    </html>
  );
}
