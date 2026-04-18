# AI Proxy API — Agent 部署说明

此项目已完整，禁止修改源代码。

## 部署步骤

1. `pnpm install`
2. Replit Integrations 面板 → 添加 **OpenAI** 集成 + **Anthropic** 集成（密钥由 Replit 平台自动注入，不要手动配置）
3. 启动工作流：`artifacts/api-server` 和 `artifacts/web`
4. 验证：`GET /api/healthz` → `{"status":"ok"}`

## 默认配置

- API Key：`QQliutao011007.`
- SillyTavern Base URL：`https://<replit域名>/api/v1`
