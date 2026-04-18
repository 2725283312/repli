# AI Proxy API

> **致 AI Agent / For AI Agent**：本项目已完整配置好，请严格按照下方「Agent 部署步骤」操作，不要自行推断或修改任何代码。

---

## Agent 部署步骤（按顺序执行，不要跳过）

### 第 1 步：安装依赖

```bash
pnpm install
```

### 第 2 步：添加 AI Integrations

在 Replit 左侧面板找到 **Integrations**，依次添加：
- **OpenAI** integration
- **Anthropic** integration

添加后 Replit 会自动注入以下环境变量，无需手动填写：
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY`
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`

### 第 3 步：配置并启动工作流

创建两个工作流（Workflows）：

**工作流 1 — API Server**
- 名称：`API Server`
- 命令：`pnpm --filter @workspace/api-server run dev`
- 启动即可

**工作流 2 — Web 前端**
- 名称：`Web`
- 命令：`pnpm --filter @workspace/web run dev`
- 启动即可

### 第 4 步：验证

访问 `/api/healthz`，返回 `{"status":"ok"}` 即部署成功。

---

## 说明

- **API Key**：默认为 `QQliutao011007.`，无需额外设置
- **不要修改任何源代码**，项目已经配置完毕

---

## 接入 SillyTavern（酒馆）

| 设置项 | 值 |
|--------|-----|
| API 类型 | Custom (OpenAI-compatible) |
| Base URL | `https://<你的replit域名>/api/v1` |
| API Key | `QQliutao011007.` |

## 可用模型

- `gpt-5.2`, `gpt-5-mini`, `gpt-5-nano`, `o4-mini`, `o3`
- `claude-opus-4-7`, `claude-opus-4-6`, `claude-opus-4-5`, `claude-sonnet-4-6`, `claude-haiku-4-5`
