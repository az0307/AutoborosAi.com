# TODO — autoborosai.com

Review date: 2026-06-27. Tracks outstanding work for this repo. Part of the Aurora/Ouroboros
consolidated review (`Aurora-AI-Agency/REPOSITORY-REVIEW.md`).

## Status

🟡 Needs work. Public-facing site + app for autoborosai.com.au — React 19 + Vite 7 + TypeScript +
Tailwind + shadcn/ui frontend, Hono v4 + tRPC v11 + Drizzle + MySQL backend. The app itself
(`src/`, `api/`, `db/`) is real and substantial; the docs and tests around it are thin.

## P0 — docs
- [ ] **Replace the default Vite/React template `README.md`.** It currently still reads "React +
      TypeScript + Vite … This template provides a minimal setup…", which is wrong for a public
      product. Write a real README: what the site is, stack, `npm run dev/build/check/lint/test`,
      env vars (`DATABASE_URL`, `JWT_SECRET`, `KIMI_API_KEY`), and deploy. `CLAUDE.md` + `info.md`
      already contain most of this.

## P1 — correctness
- [ ] Verify the pipeline: `npm install && npm run check && npm run lint && npm run build`.
- [ ] Confirm `.env.local.example` lists every variable the app reads (DB, JWT, Kimi).
- [ ] Confirm the esbuild API bundle (`dist/boot.js`) starts under `npm start` (NODE_ENV=production).

## P2 — tests & quality
- [ ] **Add tests.** Vitest is configured (`vitest.config.ts`) but there are no test files. Start
      with a tRPC router smoke test and one component render test.
- [ ] Add minimal CI (check + lint + build + test) on PR.
- [ ] Run a Drizzle migration check (`npm run db:generate` clean, `db:migrate` applies).

## Notes
- Auth is JWT via `jose`; AI via Kimi. Keep `JWT_SECRET` and `KIMI_API_KEY` out of the repo — only
  `.env.local.example` should be tracked.
- Related: `Aurora-AI-Agency/autoboros` (engine), `autoborosai-dashboard` (ops dashboard),
  `AutoBoros.AI-` (product docs).
