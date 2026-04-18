# AI Proxy API

OpenAI 兼容的 AI 代理服务，支持通过单一端点访问 OpenAI 和 Anthropic 模型。

## 快速部署到 Replit

1. 在 Replit 上新建 Repl，选择 **Import from GitHub**，粘贴本仓库地址
2. Replit 会自动识别 pnpm workspace 项目结构
3. 在 Replit 控制台设置以下环境变量（Secrets）：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PROXY_API_KEY` | 代理访问密钥 | `QQliutao011007` |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI 集成密钥（Replit 自动提供） | — |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI 集成地址（Replit 自动提供） | — |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Anthropic 集成密钥（Replit 自动提供） | — |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Anthropic 集成地址（Replit 自动提供） | — |

> **注意**：`PROXY_API_KEY` 默认值已内置为 `QQliutao011007`，无需额外设置即可使用。
> OpenAI / Anthropic 密钥需要在新 Replit 账号上通过 **AI Integrations** 功能重新连接。

4. 启动工作流后，访问 `/api/v1/models` 验证服务正常

## 接入 SillyTavern（酒馆）

- **API 类型**: Custom (OpenAI-compatible)
- **Base URL**: `https://<你的replit域名>/api/v1`
- **API Key**: `QQliutao011007`（或你自定义的 PROXY_API_KEY）

## 可用模型

- `gpt-5.2`, `gpt-5-mini`, `gpt-5-nano`
- `o4-mini`, `o3`
- `claude-opus-4-7`, `claude-opus-4-6`, `claude-opus-4-5`
- `claude-sonnet-4-6`, `claude-haiku-4-5`

## 技术栈

- **后端**: Express 5 + TypeScript
- **前端**: React + Vite
- **包管理**: pnpm workspace (monorepo)
- **Node.js**: 24
