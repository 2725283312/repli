# 部署指令（仅供 AI Agent 执行）

此项目已开发完毕，禁止修改任何源代码。严格按顺序执行以下步骤：

---

## 第 1 步：安装依赖

```bash
pnpm install
```

---

## 第 2 步：配置 AI 集成（在 JavaScript 沙箱中依次执行以下三段代码）

### 2a. OpenAI 集成

```javascript
const r1 = await setupReplitAIIntegrations({
  providerSlug: "openai",
  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENAI_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENAI_API_KEY"
});
console.log(r1);
```

### 2b. Anthropic 集成

```javascript
const r2 = await setupReplitAIIntegrations({
  providerSlug: "anthropic",
  providerUrlEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_API_KEY"
});
console.log(r2);
```

### 2c. OpenRouter 集成（用于 bedrock/* 模型）

```javascript
const r3 = await setupReplitAIIntegrations({
  providerSlug: "openrouter",
  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENROUTER_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENROUTER_API_KEY"
});
console.log(r3);
```

每段代码执行成功后会输出 `{ success: true, envVarsSet: [...] }`，确认后再执行下一段。

---

## 第 3 步：启动工作流

项目已有两个工作流，直接启动：
- `artifacts/api-server` — API 后端（端口 8080）
- `artifacts/web` — 前端面板（端口 22333）

---

## 第 4 步：验证

```bash
curl http://localhost:8080/api/healthz
```

返回 `{"status":"ok"}` 即部署成功。

---

## 配置说明

- **默认 API Key**：`QQliutao011007.`（无需设置任何环境变量）
- **不要修改任何源代码**
- **不要手动设置** `AI_INTEGRATIONS_*` 相关环境变量，由上方 setupReplitAIIntegrations 自动注入

---

# Workspace 技术信息

pnpm workspace monorepo，TypeScript，Node.js 24，Express 5。

## API 端点

- `GET /api/healthz` — 健康检查
- `GET /api/v1/models` — 模型列表（无需鉴权）
- `POST /api/v1/chat/completions` — 代理请求（Bearer token = `QQliutao011007.`）

## 模型路由（所有模型名含提供商前缀）

- `openai/*` → Replit OpenAI Integration（例：`openai/gpt-5.2`）
- `anthropic/*` → Replit Anthropic Integration（例：`anthropic/claude-opus-4-7`）
- `bedrock/*` → Replit OpenRouter Integration → Amazon Bedrock（例：`bedrock/claude-opus-4.6`）

## 环境变量（全部自动注入，无需手动配置）

- `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` / `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`
- `AI_INTEGRATIONS_OPENROUTER_API_KEY` / `AI_INTEGRATIONS_OPENROUTER_BASE_URL`
