import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Proxy API</title>
  <style>
    body { font-family: 'Courier New', monospace; background: #0d1117; color: #c9d1d9; max-width: 800px; margin: 60px auto; padding: 0 20px; line-height: 1.7; }
    h1 { color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 12px; }
    h2 { color: #79c0ff; margin-top: 32px; }
    code { background: #161b22; border: 1px solid #30363d; padding: 2px 6px; border-radius: 4px; color: #ff7b72; font-size: 0.9em; }
    pre { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; overflow-x: auto; color: #a5d6ff; }
    .badge { display: inline-block; background: #238636; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 0.8em; margin-left: 8px; }
    .model-list { list-style: none; padding: 0; }
    .model-list li { padding: 6px 0; border-bottom: 1px solid #21262d; }
    .openai { color: #3fb950; }
    .anthropic { color: #d2a8ff; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    td, th { text-align: left; padding: 8px 12px; border: 1px solid #30363d; }
    th { background: #161b22; color: #79c0ff; }
  </style>
</head>
<body>
  <h1>🤖 AI Proxy API <span class="badge">ONLINE</span></h1>
  <p>OpenAI 兼容代理，支持 OpenAI 与 Anthropic 模型，供 SillyTavern / 酒馆直连使用。</p>
  <p>此服务通过 Replit AI 积分计费，无需自备官方 API Key。</p>

  <h2>酒馆连接配置</h2>
  <table>
    <tr><th>项目</th><th>填写值</th></tr>
    <tr><td>API 类型</td><td>Custom (OpenAI-compatible)</td></tr>
    <tr><td>Base URL</td><td><code>https://YOUR-DOMAIN/api/v1</code></td></tr>
    <tr><td>API Key</td><td>你设置的 PROXY_API_KEY</td></tr>
  </table>

  <h2>可用模型</h2>
  <ul class="model-list">
    <li><span class="openai">●</span> gpt-5.2 — OpenAI 最强通用模型</li>
    <li><span class="openai">●</span> gpt-5-mini — 高性价比</li>
    <li><span class="openai">●</span> gpt-5-nano — 最快最省积分</li>
    <li><span class="openai">●</span> o4-mini — 复杂推理</li>
    <li><span class="openai">●</span> o3 — 顶级推理</li>
    <li><span class="anthropic">●</span> claude-opus-4-7 — Anthropic 最强</li>
    <li><span class="anthropic">●</span> claude-opus-4-6 — Opus 上代</li>
    <li><span class="anthropic">●</span> claude-opus-4-5 — Opus 上代</li>
    <li><span class="anthropic">●</span> claude-sonnet-4-6 — 均衡性能</li>
    <li><span class="anthropic">●</span> claude-haiku-4-5 — 最快 Claude</li>
  </ul>

  <h2>接口</h2>
  <pre>GET  /api/v1/models               # 模型列表（无需鉴权）
POST /api/v1/chat/completions      # 聊天补全（需 Bearer Token）
GET  /api/healthz                  # 健康检查</pre>

  <h2>测试命令</h2>
  <pre>curl https://YOUR-DOMAIN/api/v1/models

curl -X POST https://YOUR-DOMAIN/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \\
  -d '{"model":"gpt-5-nano","messages":[{"role":"user","content":"你好"}]}'</pre>
</body>
</html>`);
});

export default router;
