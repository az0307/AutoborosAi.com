# autoborosai.com

Public website and application for [autoborosai.com.au](https://autoborosai.com.au) — the AutoBoros AI automation platform.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Hono (Node) + tRPC + Drizzle ORM + MySQL2 |
| Auth | JWT via `jose` |
| State | TanStack Query v5 |
| AI | Kimi AI integration |
| Deployment | Node production server (`dist/boot.js`) |

## Development

```bash
npm install
npm run dev      # frontend + backend dev server
npm run build    # vite build + esbuild API server
npm start        # production: node dist/boot.js
npm run check    # TypeScript
npm run lint     # ESLint
npm test         # Vitest
```

## Database

```bash
npm run db:generate   # generate Drizzle migration
npm run db:migrate    # run migrations
npm run db:push       # schema sync (dev only)
```

## Environment

```
DATABASE_URL=mysql://user:pass@host:3306/dbname
JWT_SECRET=<random 32+ chars>
KIMI_API_KEY=<kimi ai api key>
NODE_ENV=development
```

Copy `.env.local.example` → `.env.local` for local dev. Never commit `.env.local`.

## Related

- [AutoBoros engine](https://github.com/az0307/Aurora-AI-Agency/tree/main/autoboros) — FastAPI backend + React cockpit
- [Nexus Dashboard](https://github.com/az0307/autoborosai-dashboard) — ops monitoring (Next.js)
- [AutoBoros product](https://github.com/az0307/AutoBoros.AI-) — product docs & roadmap
