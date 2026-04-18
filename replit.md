# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI Providers**: OpenAI (via Replit AI Integrations), Anthropic (via Replit AI Integrations)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## AI Proxy API

The api-server exposes an OpenAI-compatible proxy at `/api/v1/`:

- `GET /api/v1/models` — returns model list (no auth required)
- `POST /api/v1/chat/completions` — proxies to OpenAI or Anthropic based on model prefix (requires Bearer token)
- `GET /api/healthz` — health check

### Model Routing
- `gpt-*` and `o*` models → OpenAI (via `@workspace/integrations-openai-ai-server`)
- `claude-*` models → Anthropic (via `@workspace/integrations-anthropic-ai`)

### Secrets
- `PROXY_API_KEY` — Bearer token for external clients (e.g. SillyTavern)
- `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL` — auto-provisioned by Replit
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — auto-provisioned by Replit

### SillyTavern / 酒馆 Connection
- API Type: Custom (OpenAI-compatible)
- Base URL: `https://<domain>/api/v1`
- API Key: value of `PROXY_API_KEY`

See `artifacts/api-server/src/routes/proxy.ts` for the full implementation.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
