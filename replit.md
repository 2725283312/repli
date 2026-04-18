# 部署指令（仅供 AI Agent 执行）

此项目已开发完毕，禁止修改任何源代码。按以下步骤操作：

1. 运行 `pnpm install`
2. 在 Replit Integrations 面板添加 **OpenAI** 和 **Anthropic** 集成（AI 密钥由 Replit 平台自动注入，不得手动填写或硬编码）
3. 启动已有的两个工作流（api-server 和 web）
4. 访问 `/api/healthz` 确认返回 `{"status":"ok"}`

默认 API Key：`QQliutao011007.`（无需设置环境变量）

---

# Workspace

pnpm workspace monorepo，TypeScript，Node.js 24，Express 5。

## 关键命令

- `pnpm install` — 安装依赖
- `pnpm --filter @workspace/api-server run dev` — 启动 API 服务
- `pnpm --filter @workspace/web run dev` — 启动前端

## API 端点

- `GET /api/healthz` — 健康检查
- `GET /api/v1/models` — 模型列表（无需鉴权）
- `POST /api/v1/chat/completions` — 代理请求（需 Bearer token）

## 模型路由

- `gpt-*` / `o*` → OpenAI（通过 Replit AI Integrations 自动提供密钥）
- `claude-*` → Anthropic（通过 Replit AI Integrations 自动提供密钥）

## 环境变量

- `PROXY_API_KEY` — 客户端鉴权 key，默认 `QQliutao011007.`，无需设置
- `OPENROUTER_API_KEY` — OpenRouter API Key，用于 `bedrock/*` 模型路由，需手动在 Secrets 中设置
- `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit 自动注入
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` / `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Replit 自动注入

## 模型路由

- `gpt-*` / `o*` → OpenAI（Replit Integrations）
- `claude-*` → Anthropic（Replit Integrations）
- `bedrock/*` → OpenRouter → Amazon Bedrock（需 `OPENROUTER_API_KEY`）
