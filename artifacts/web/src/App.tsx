import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const OPENAI_MODELS = [
  { id: "gpt-5.2", desc: "最强通用，推荐首选" },
  { id: "gpt-5-mini", desc: "高性价比" },
  { id: "gpt-5-nano", desc: "最快、最省积分" },
  { id: "o4-mini", desc: "复杂推理" },
  { id: "o3", desc: "顶级推理" },
];

const ANTHROPIC_MODELS = [
  { id: "claude-opus-4-7", desc: "Anthropic 最强" },
  { id: "claude-opus-4-6", desc: "Opus 上代" },
  { id: "claude-opus-4-5", desc: "Opus 上代" },
  { id: "claude-sonnet-4-6", desc: "均衡性能，推荐首选" },
  { id: "claude-haiku-4-5", desc: "最快 Claude" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-white/70"
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}

function StatusBadge() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    fetch(`${BASE_URL}/api/healthz`)
      .then((r) => r.ok ? setOk(true) : setOk(false))
      .catch(() => setOk(false));
  }, []);
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
      ok === null ? "bg-yellow-500/20 text-yellow-300" :
      ok ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        ok === null ? "bg-yellow-400 animate-pulse" :
        ok ? "bg-green-400" : "bg-red-400"
      }`} />
      {ok === null ? "检测中..." : ok ? "服务正常" : "服务异常"}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40 w-28 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <code className="text-sm text-blue-300 font-mono break-all flex-1">{value}</code>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function App() {
  const domain = window.location.host;
  const baseUrl = `https://${domain}/api/v1`;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">
      <div className="max-w-2xl mx-auto px-5 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold tracking-tight">AI Proxy API</h1>
            <StatusBadge />
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            OpenAI 兼容代理，支持 OpenAI 与 Anthropic 模型。<br />
            通过 Replit AI 积分计费，无需自备官方 Key。
          </p>
        </div>

        {/* Connection Config */}
        <div className="mb-8 bg-white/[0.04] rounded-xl border border-white/8 p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">酒馆连接配置</h2>
          <div>
            <Row label="API 类型" value="Custom (OpenAI-compatible)" />
            <Row label="Base URL" value={baseUrl} />
            <Row label="API Key" value="你设置的 PROXY_API_KEY" />
          </div>
        </div>

        {/* Models */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">可用模型</h2>
          <div className="grid gap-2">
            <div className="bg-white/[0.04] rounded-xl border border-white/8 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-medium text-green-300 uppercase tracking-wider">OpenAI</span>
              </div>
              <div className="space-y-2">
                {OPENAI_MODELS.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-4">
                    <code className="text-sm text-blue-300 font-mono">{m.id}</code>
                    <span className="text-xs text-white/35">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.04] rounded-xl border border-white/8 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-xs font-medium text-purple-300 uppercase tracking-wider">Anthropic</span>
              </div>
              <div className="space-y-2">
                {ANTHROPIC_MODELS.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-4">
                    <code className="text-sm text-purple-300 font-mono">{m.id}</code>
                    <span className="text-xs text-white/35">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* curl test */}
        <div className="mb-8 bg-white/[0.04] rounded-xl border border-white/8 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">测试命令</h2>
            <CopyButton text={`curl -X POST ${baseUrl}/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \\\n  -d '{"model":"gpt-5-nano","messages":[{"role":"user","content":"你好"}]}'`} />
          </div>
          <pre className="text-xs text-white/60 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
{`curl -X POST ${baseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \\
  -d '{"model":"gpt-5-nano","messages":[{"role":"user","content":"你好"}]}'`}
          </pre>
        </div>

        {/* Endpoints */}
        <div className="bg-white/[0.04] rounded-xl border border-white/8 p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">接口端点</h2>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex gap-3">
              <span className="text-green-400 w-12 flex-shrink-0">GET</span>
              <span className="text-white/60">/api/v1/models</span>
              <span className="text-white/30 ml-auto">无需鉴权</span>
            </div>
            <div className="flex gap-3">
              <span className="text-yellow-400 w-12 flex-shrink-0">POST</span>
              <span className="text-white/60">/api/v1/chat/completions</span>
              <span className="text-white/30 ml-auto">需 Bearer Token</span>
            </div>
            <div className="flex gap-3">
              <span className="text-green-400 w-12 flex-shrink-0">GET</span>
              <span className="text-white/60">/api/healthz</span>
              <span className="text-white/30 ml-auto">健康检查</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/20">Powered by Replit AI Integrations</p>
      </div>
    </div>
  );
}
