# 部署指令（仅供 AI Agent 执行）

## ⛔ 禁止项（必读，违反会导致部署失败或浪费时间）

- **禁止**读取 integrations skill / ai-integrations-* skill / 搜索集成方式
- **禁止**调用 createArtifact / updateArtifact / listArtifacts（artifact 已存在）
- **禁止**修改任何源代码
- **禁止**手动设置 AI_INTEGRATIONS_* 环境变量
- **禁止**手动创建名为 "API Server" 的工作流——会与 artifact 工作流竞争端口 8080，导致 artifact 工作流崩溃、对外服务中断（已知 bug 根因）

---

## ✅ 执行步骤（完全按顺序，不要跳过或替换）

### 步骤 1：安装依赖

```bash
pnpm install
```

### 步骤 2：配置 AI 集成

`setupReplitAIIntegrations` 在代码沙箱中可直接调用，无需加载任何 skill。依次执行以下三段：

```javascript
// OpenAI
await setupReplitAIIntegrations({
  providerSlug: "openai",
  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENAI_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENAI_API_KEY"
});
```

```javascript
// Anthropic
await setupReplitAIIntegrations({
  providerSlug: "anthropic",
  providerUrlEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_API_KEY"
});
```

```javascript
// OpenRouter（用于 bedrock/* 模型）
await setupReplitAIIntegrations({
  providerSlug: "openrouter",
  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENROUTER_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENROUTER_API_KEY"
});
```

### 步骤 3：启动工作流

**API 服务**（端口 8080）：
```
pnpm --filter @workspace/api-server run dev
```

**Web 前端**（必须包含 BASE_PATH 和 PORT，否则启动失败）：
```
PORT=22333 BASE_PATH=/ pnpm --filter @workspace/web run dev
```

### 步骤 4：验证

```bash
curl http://localhost:8080/api/healthz
```

返回 `{"status":"ok"}` 即完成。

---

## 配置说明

- **默认 API Key**：`QQliutao011007.`（无需设置 PROXY_API_KEY）
- **artifact 已存在**：`artifacts/api-server/artifact.toml` 和 `artifacts/web/artifact.toml` 均已配置，直接启动工作流即可
- **模型路由**：`openai/*` → OpenAI，`anthropic/*` → Anthropic，`bedrock/*` → OpenRouter → Amazon Bedrock

---

# 技术信息

pnpm workspace monorepo，TypeScript，Node.js 24，Express 5。

- `GET /api/healthz` — 健康检查
- `GET /api/v1/models` — 模型列表（无需鉴权）
- `POST /api/v1/chat/completions` — Bearer: `QQliutao011007.`
