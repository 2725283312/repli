# Workspace

## ⚡ 首次部署指令（Agent 必读，新账号 import 后立即执行）

**这是一个已完整开发完毕的项目，不需要任何代码修改。** 请按以下步骤完成部署：

1. **安装依赖**（如果 node_modules 不存在）：
   ```
   pnpm install
   ```

2. **添加 AI Integrations**：在 Replit 左侧面板 → Integrations，添加 **OpenAI** 和 **Anthropic** 集成。完成后环境变量会自动注入，无需手动配置。

3. **启动工作流**：以下工作流应已存在（来自 artifact.toml），直接启动即可：
   - `artifacts/api-server` — API 后端服务
   - `artifacts/web` — 前端面板

4. **验证**：访问 `/api/healthz` 返回 `{"status":"ok"}` 即成功。

**默认 API Key**：`QQliutao011007.`（无需设置 PROXY_API_KEY 环境变量）

**不要修改任何源代码。不要重新生成或重构任何内容。**

---

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
