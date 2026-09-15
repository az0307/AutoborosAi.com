# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

autoborosai.com is the public-facing website and application for [autoborosai.com.au](https://autoborosai.com.au) — a full-stack React + Hono app built with the OKComputer AI coding tool.

**Stack:** React 19 + Vite 7 + TypeScript + Tailwind + shadcn/ui on the front end (`src/`); Hono v4 (Node adapter) + tRPC v11 + Drizzle ORM + MySQL2 on the back end (`api/`, entry `api/boot.ts`); JWT auth via `jose`; TanStack Query; Kimi AI integration. Build is Vite (frontend) + esbuild (`api/boot.ts` → `dist/`). Read `package.json` for the full script list (`dev`, `build`, `check`, `lint`, `test` via Vitest, and `db:*` via drizzle-kit) and `db/schema.ts` for the data model.

## Environment

Config via `DATABASE_URL`, `JWT_SECRET` (random 32+ chars), `KIMI_API_KEY`, `NODE_ENV`. Copy `.env.local.example` → `.env.local` for local dev. **Never commit `.env.local` or any real secret** — use the hosting platform's secret store for `JWT_SECRET`.

## Related Repos

- [Aurora-AI-Agency/autoboros](https://github.com/az0307/Aurora-AI-Agency/tree/main/autoboros) — AutoBoros engine
- [autoborosai-dashboard](https://github.com/az0307/autoborosai-dashboard) — Nexus ops dashboard (Next.js)
- [AutoBoros.AI-](https://github.com/az0307/AutoBoros.AI-) — product docs & roadmap
