# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

autoborosai.com is the public-facing website and application for [autoborosai.com.au](https://autoborosai.com.au).
It is a full-stack React + Hono application built with the OKComputer AI coding tool.

## Tech Stack

- **Frontend**: React 19 + Vite 7 + TypeScript + Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Backend**: Hono v4 (Node adapter) + tRPC v11 + Drizzle ORM + MySQL2
- **Auth**: JWT via `jose`
- **State**: TanStack Query v5
- **AI**: Kimi AI integration
- **Build**: Vite (frontend) + esbuild (API server → `dist/boot.js`)
- **Testing**: Vitest
- **Formatting**: Prettier + ESLint

## Commands

```bash
npm install
npm run dev          # dev server: Vite frontend + Hono API (via @hono/vite-dev-server)
npm run build        # vite build + esbuild api/boot.ts → dist/
npm start            # production: NODE_ENV=production node dist/boot.js
npm run check        # TypeScript type check
npm run lint         # ESLint
npm run format       # Prettier
npm test             # Vitest unit tests
npm run db:generate  # drizzle-kit generate migration
npm run db:migrate   # drizzle-kit migrate
npm run db:push      # drizzle-kit push (schema sync, dev only)
```

## Architecture

```
src/                    Frontend (React 19 / Vite)
  client.ts             tRPC client
  main.tsx              React entry
  App.tsx               Root component + router
  components/           UI components (shadcn/ui + custom)
  pages/                Route pages
  hooks/                Custom hooks
  lib/                  Utilities, constants

api/                    Backend (Hono + tRPC)
  boot.ts               Server entry (Hono + @hono/node-server)
  router.ts             tRPC root router
  routes/               Individual tRPC routers

db/                     Drizzle ORM
  schema.ts             Table definitions
  index.ts              Drizzle client
```

## Environment Variables

```
DATABASE_URL=mysql://user:pass@host:3306/dbname
JWT_SECRET=<random 32+ chars>  # never commit; use hosting platform secrets
KIMI_API_KEY=<kimi api key>
NODE_ENV=development
```

Copy `.env.local.example` → `.env.local` for local dev. Never commit `.env.local` or any real secrets.

## Related Repos

- [Aurora-AI-Agency/autoboros](https://github.com/az0307/Aurora-AI-Agency/tree/main/autoboros) — AutoBoros engine
- [autoborosai-dashboard](https://github.com/az0307/autoborosai-dashboard) — Nexus ops dashboard (Next.js)
- [AutoBoros.AI-](https://github.com/az0307/AutoBoros.AI-) — product docs & roadmap
