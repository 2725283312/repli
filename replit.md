# 部署指令（仅供 AI Agent 执行）

## ⛔ 禁止项（违反会浪费大量 token）

- **禁止**读取任何 skill（integrations、ai-integrations-*、artifacts、workflows 等）
- **禁止**读取项目文件（package.json、tsconfig.json、artifact.toml、src/ 等）
- **禁止**运行 ls / find / grep 等探索命令
- **禁止**调用 createArtifact / updateArtifact / listArtifacts（已存在）
- **禁止**手动设置 AI_INTEGRATIONS_* 环境变量
- **禁止**手动创建名为 "API Server" 的工作流（会与 artifact 工作流抢占端口 8080，导致服务崩溃）
- **禁止**修改任何源代码

---

## ✅ 执行步骤（按顺序执行，不得跳过）

### 步骤 1：安装依赖
```bash
pnpm install
```

### 步骤 2：配置 AI 集成（3 个，一次执行）

`setupReplitAIIntegrations` 可在代码沙箱直接调用，无需加载任何 skill：

```javascript
for (const cfg of [
  { providerSlug: "openai",      providerUrlEnvVarName: "AI_INTEGRATIONS_OPENAI_BASE_URL",     providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENAI_API_KEY" },
  { providerSlug: "anthropic",   providerUrlEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_BASE_URL",  providerApiKeyEnvVarName: "AI_INTEGRATIONS_ANTHROPIC_API_KEY" },
  { providerSlug: "openrouter",  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENROUTER_BASE_URL", providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENROUTER_API_KEY" },
]) { await setupReplitAIIntegrations(cfg); }
```

### 步骤 3：启动工作流

- API 服务：`pnpm --filter @workspace/api-server run dev`
- Web 前端（必须带环境变量）：`PORT=22333 BASE_PATH=/ pnpm --filter @workspace/web run dev`

### 步骤 4：验证
```bash
curl http://localhost:8080/api/healthz
```
返回 `{"status":"ok"}` 即完成，无需其他验证。

---

## 配置

- **API Key**：`QQliutao011007.`（默认内置，无需设置）
- **路由**：`openai/*` → OpenAI，`anthropic/*` → Anthropic，`bedrock/*` → OpenRouter → Amazon Bedrock
- **端点**：`POST /api/v1/chat/completions`（Bearer token），`GET /api/v1/models`（无需鉴权）
