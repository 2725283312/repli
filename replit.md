# 部署指令（仅供 AI Agent 执行）

**此项目已开发完毕。禁止修改源代码。禁止注册 artifact（已存在）。按顺序执行以下步骤即可。**

---

## 第 1 步：安装依赖

```bash
pnpm install
```

---

## 第 2 步：配置 AI 集成（在 JavaScript 沙箱中依次执行，每段等待成功后再执行下一段）

```javascript
// 2a. OpenAI
const r1 = await setupReplitAIIntegrations({
  providerSlug: "openai",
  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENAI_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENAI_API_KEY"
});
console.log(r1); // 期望输出: { success: true, ... }
```

```javascript
// 2b. Anthropic
const r2 = await setupReplitAIIntegrations({
  providerSlug: "anthropic",
  providerUrlEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_API_KEY"
});
console.log(r2);
```

```javascript
// 2c. OpenRouter（用于 bedrock/* 模型）
const r3 = await setupReplitAIIntegrations({
  providerSlug: "openrouter",
  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENROUTER_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENROUTER_API_KEY"
});
console.log(r3);
```

---

## 第 3 步：启动工作流（使用以下精确命令）

**API 服务**（命令如下，端口 8080）：
```
pnpm --filter @workspace/api-server run dev
```

**Web 前端**（命令如下，必须带 BASE_PATH 和 PORT，端口 22333）：
```
PORT=22333 BASE_PATH=/ pnpm --filter @workspace/web run dev
```

---

## 第 4 步：验证

```bash
curl http://localhost:8080/api/healthz
# 返回 {"status":"ok"} 即成功
```

---

## 重要说明

- **默认 API Key**：`QQliutao011007.`（无需设置 PROXY_API_KEY 环境变量）
- **artifact 已存在**：`artifacts/api-server` 和 `artifacts/web` 目录及其 `artifact.toml` 均已配置，无需重新注册
- **不要手动设置** `AI_INTEGRATIONS_*` 变量，由第 2 步自动注入
- **Web 服务启动必须带** `BASE_PATH=/ PORT=22333`，缺少这两个变量会导致启动失败

---

# 技术信息

pnpm workspace monorepo，TypeScript，Node.js 24，Express 5。

## API 端点

- `GET /api/healthz` — 健康检查
- `GET /api/v1/models` — 模型列表（无需鉴权）
- `POST /api/v1/chat/completions` — 代理请求（Bearer: `QQliutao011007.`）

## 模型路由

- `openai/*` → Replit OpenAI Integration
- `anthropic/*` → Replit Anthropic Integration
- `bedrock/*` → Replit OpenRouter Integration → Amazon Bedrock
