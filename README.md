# ResumeFeed frontend

The ResumeFeed frontend is a Next.js application for sharing resumes and getting community feedback. Signed-in users can manage a profile, upload a PDF to the feed, rate and react to resumes, take part in two-level comment threads, and read activity notifications.

This application is the browser-facing half of the system. The companion backend README covers API and database setup.

## Stack

- Next.js 16 with the App Router, React 19, and TypeScript
- Tailwind CSS v4 and shadcn-style UI components
- Redux Toolkit and RTK Query for client-side API state and cache updates
- Supabase Auth for email/password and Google sign-in, with PKCE cookie sessions
- Supabase Storage for direct avatar and PDF uploads

## Architecture

```text
Browser
  |
  +-- Next.js App Router (app/) ------------------- pages, layouts, metadata
  |
  +-- Supabase browser client --------------------- sign-in/session + uploads
  |     |                                             avatars: public bucket
  |     +------------------------------------------ resumes: private bucket
  |
  +-- Redux Provider -> RTK Query (store/api/) ---- API cache and mutations
          |
          | Authorization: Bearer <Supabase access token>
          v
      Express API at NEXT_PUBLIC_API_URL/api
          |
          +-- Supabase Auth token verification
          +-- PostgreSQL feed data and signed PDF links
```

The frontend uploads a PDF directly to the private `resumes` storage bucket. It then calls the API to create the feed record; the API independently verifies that the object belongs to the authenticated user. PDF reads use short-lived signed URLs returned by the API, not permanent public object URLs.

### Important directories

```text
app/                    App Router pages, route groups, layouts, and auth callback
  (auth)/               Login, signup, and auth-error pages
  (site)/               Landing, feed, resume detail, profiles, account, notifications
  actions/auth.ts       Server actions for login, signup, and sign-out
components/             Feature components and reusable UI primitives
lib/
  supabase/             Browser, server, and proxy Supabase clients
  storage/              Avatar/PDF validation and direct-upload helpers
  resume/               Presentation and optimistic-update helpers
store/
  api/                  RTK Query base API and feature endpoint definitions
  providers.tsx         Redux provider for the client component tree
types/                  Frontend API/domain contracts
proxy.ts                Session refresh and protected-route redirect handling
```

### Request and auth flow

1. The browser Supabase client stores the authenticated session in cookies.
2. `proxy.ts` refreshes that session and redirects anonymous visitors away from protected pages such as `/feed`, `/account`, and `/notifications`.
3. RTK Query gets the current access token and adds it to every API request.
4. The Express API verifies the token with Supabase before serving a protected resource.
5. RTK Query updates or invalidates its cache after mutations. Ratings, reactions, and comment reactions use optimistic UI updates.

Route redirects improve the experience; API authorization is the security boundary. Do not rely on the frontend proxy as authorization for backend data.

## Run locally

### Prerequisites

- Node.js 20 or newer and npm
- A Supabase project shared with the backend
- The backend running locally, normally at `http://localhost:4000`

### 1. Configure Supabase

In Supabase Dashboard, create or use a project and collect the Project URL and publishable/anon key from **Project Settings -> API**.

In **Authentication -> URL Configuration**, set the Site URL to `http://localhost:3000` and add this Redirect URL:

```text
http://localhost:3000/auth/callback
```

Enable the email/password provider. If Google sign-in is used, also configure the Google provider and its OAuth credentials in Supabase.

The backend setup creates the `avatars` and `resumes` buckets and their access policies. Run its `supabase/storage-setup.sql` script once before testing uploads.

### 2. Create the environment file

From this directory:

```powershell
Copy-Item .env.local.example .env.local
```

Set the values in `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=resumes
NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET=avatars
```

`NEXT_PUBLIC_*` values are embedded in browser code. Never put the Supabase service-role key in this file.

### 3. Install and start

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. Start the backend in another terminal before using the account, feed, profile, comment, rating, reaction, or notification features.

### 4. Verify the integration

1. Open `/signup` and create an account (or log in).
2. If email confirmation is enabled, follow the link back to `/auth/callback`.
3. Open `/account`, update the profile, and optionally upload an avatar.
4. Open `/feed`, upload a PDF smaller than 5 MiB, and interact with a feed post.

If the UI reports that Supabase is unconfigured, check the two required public Supabase variables and restart `npm run dev`. If API-backed screens fail, first confirm that <http://localhost:4000/health> returns `{ "status": "ok" }`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server on port 3000. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run format:check` | Check formatting with Prettier. |
| `npm run format` | Format source files with Prettier. |

## Configuration notes

- Frontend and backend bucket names must match. The defaults are `resumes` and `avatars`.
- Resume PDFs are limited to 5 MiB and must be uploaded under `<authenticated-user-id>/<file>.pdf`; that first path segment is required by the storage policy.
- Avatars are public images limited to 2 MiB (PNG, JPEG, or WebP).
- For deployment, set `NEXT_PUBLIC_SITE_URL` to the HTTPS frontend origin and add `<origin>/auth/callback` to Supabase Redirect URLs. Set `NEXT_PUBLIC_API_URL` to the deployed API origin and update the backend's `CORS_ORIGIN` to the same frontend origin.

## Related documentation

- [`PROJECT-OVERVIEW.md`](./PROJECT-OVERVIEW.md) records product and design context.
- The backend [README](../resumefeed-backend/README.md) covers API routes, database migrations, storage initialization, and server configuration.
