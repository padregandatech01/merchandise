# LOXADA Merchandise

Clean Next.js / Tailwind / Supabase Auth starter. Business features are intentionally absent. No demo accounts, records, metrics, catalogs or business database migrations are included.

## Run

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env.local`, and supply this application's actual Supabase URL and publishable key. Never commit secrets or expose a service-role key.

- `npm run dev`: local development
- `npm run lint`: ESLint
- `npm run typecheck`: TypeScript
- `npm run build`: production build
- `npm start`: serve the production build

The landing page and authentication forms render without environment values. Authentication requires a configured, available Supabase project and valid redirect settings. Authentication plumbing is retained; department roles, Superadmin authorization and business RLS are not implemented by this starter. Registration never grants an administrative role.

Routes: `/`, `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password`, `/protected` (requires authentication).

## Recovery

Cleanup starts from `4fd4e64b92f1f9ceb8d9d98d2bd8845134ed199f` and preserves it at [the backup branch](https://github.com/padregandatech01/merchandise/tree/backup/before-template-cleanup-20261028-1793220498599). All original commits remain in history. The blank foundation adapts the previously cleaned starter at `lozadatech01/mangalighnovelsubsystem@c5c60060724dcfac15775c3be9e7fe44bf91defa`, itself derived from the same Vercel Supabase starter used by these four repos.

Restore committed files through a reviewed revert/restoration commit. Do not force-push or reset remote history.

This cleanup changes repository files only. It does not reset Supabase schemas, data, Auth users, migration history, project settings or Vercel environment variables. Historical business migrations remain recoverable in the backup/history; reconcile the real database before adding or applying new migrations. A successful local build does not verify live database connectivity, authentication or deployment health.

All scheduled construction remains paused. Build future business features from the accepted LOXADA v1.0 and the user's later decisions.
