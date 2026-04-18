import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Lazy OpenRouter client — only created when a bedrock/* model is requested
let _openrouterClient: OpenAI | null = null;
function getOpenrouterClient(): OpenAI {
  if (!_openrouterClient) {
    const apiKey = process.env["OPENROUTER_API_KEY"];
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");
    _openrouterClient = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://replit.com",
        "X-Title": "AI Proxy",
      },
    });
  }
  return _openrouterClient;
}

// Map bedrock/claude-* → OpenRouter model name (anthropic/claude-*)
function bedrockToOrModel(model: string): string {
  const suffix = model.slice("bedrock/".length);
  return suffix.startsWith("claude-") ? `anthropic/${suffix}` : suffix;
}

const MODEL_MAP: Record<string, { provider: "openai" | "anthropic"; realModel: string }> = {
  "gpt-5.2": { provider: "openai", realModel: "gpt-5.2" },
  "gpt-5-mini": { provider: "openai", realModel: "gpt-5-mini" },
  "gpt-5-nano": { provider: "openai", realModel: "gpt-5-nano" },
  "o4-mini": { provider: "openai", realModel: "o4-mini" },
  "o3": { provider: "openai", realModel: "o3" },
  "claude-opus-4-6": { provider: "anthropic", realModel: "claude-opus-4-6" },
  "claude-sonnet-4-6": { provider: "anthropic", realModel: "claude-sonnet-4-6" },
  "claude-haiku-4-5": { provider: "anthropic", realModel: "claude-haiku-4-5" },
  "claude-opus-4-5": { provider: "anthropic", realModel: "claude-opus-4-5" },
  "claude-opus-4-7": { provider: "anthropic", realModel: "claude-opus-4-7" },
};

const MODELS_LIST = {
  object: "list",
  data: [
    { id: "gpt-5.2", object: "model", owned_by: "openai" },
    { id: "gpt-5-mini", object: "model", owned_by: "openai" },
    { id: "gpt-5-nano", object: "model", owned_by: "openai" },
    { id: "o4-mini", object: "model", owned_by: "openai" },
    { id: "o3", object: "model", owned_by: "openai" },
    { id: "claude-opus-4-6", object: "model", owned_by: "anthropic" },
    { id: "claude-sonnet-4-6", object: "model", owned_by: "anthropic" },
    { id: "claude-haiku-4-5", object: "model", owned_by: "anthropic" },
    { id: "claude-opus-4-5", object: "model", owned_by: "anthropic" },
    { id: "claude-opus-4-7", object: "model", owned_by: "anthropic" },
    // Bedrock via OpenRouter
    { id: "bedrock/claude-3-5-sonnet-20241022-v2:0", object: "model", owned_by: "amazon-bedrock" },
    { id: "bedrock/claude-3-5-haiku-20241022", object: "model", owned_by: "amazon-bedrock" },
    { id: "bedrock/claude-3-opus-20240229", object: "model", owned_by: "amazon-bedrock" },
    { id: "bedrock/claude-opus-4-5", object: "model", owned_by: "amazon-bedrock" },
    { id: "bedrock/claude-sonnet-4-5", object: "model", owned_by: "amazon-bedrock" },
    { id: "bedrock/claude-haiku-4-5", object: "model", owned_by: "amazon-bedrock" },
  ],
};

const OPENAI_NO_TEMP = new Set(["gpt-5.2", "gpt-5-mini", "gpt-5-nano", "o4-mini", "o3"]);

function authMiddleware(req: Request, res: Response, next: () => void) {
  const proxyKey = process.env["PROXY_API_KEY"] ?? "QQliutao011007.";
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!proxyKey || token !== proxyKey) {
    res.status(401).json({
      error: { message: "Unauthorized: invalid or missing API key", type: "auth_error" },
    });
    return;
  }
  next();
}

router.get("/models", (_req, res) => {
  res.json(MODELS_LIST);
});

router.post("/chat/completions", authMiddleware, async (req: Request, res: Response) => {
  const body = req.body as {
    model: string;
    messages: Array<{ role: string; content: string }>;
    stream?: boolean;
    max_tokens?: number;
    max_completion_tokens?: number;
    temperature?: number;
    [key: string]: unknown;
  };

  const requestedModel = body.model ?? "";
  const isStream = body.stream === true;
  const messages = body.messages ?? [];

  // ── Bedrock via OpenRouter ─────────────────────────────────────────────────
  if (requestedModel.startsWith("bedrock/")) {
    const orModel = bedrockToOrModel(requestedModel);
    const clientMaxTokens = body.max_tokens ?? body.max_completion_tokens;
    const maxTokens = clientMaxTokens && clientMaxTokens > 0 ? clientMaxTokens : 16384;

    const orParams = {
      model: orModel,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: isStream,
      max_tokens: maxTokens,
      ...(body.temperature != null ? { temperature: body.temperature } : {}),
      // Force Amazon Bedrock as the provider
      provider: { only: ["Amazon Bedrock"] },
    } as unknown as OpenAI.ChatCompletionCreateParamsStreaming;

    logger.info({ model: requestedModel, orModel, stream: isStream }, "bedrock/openrouter request");

    let or: OpenAI;
    try {
      or = getOpenrouterClient();
    } catch (err: unknown) {
      res.status(500).json({ error: { message: (err as Error).message, type: "config_error" } });
      return;
    }

    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const keepalive = setInterval(() => {
        try { res.write(": keepalive\n\n"); } catch (_) { /* ignore */ }
      }, 5000);

      let ended = false;
      function safeEnd() {
        if (!ended) { ended = true; clearInterval(keepalive); try { res.end(); } catch (_) { /* ignore */ } }
      }
      res.on("close", () => { ended = true; clearInterval(keepalive); });

      try {
        const stream = await or.chat.completions.create(orParams);
        for await (const chunk of stream as AsyncIterable<OpenAI.ChatCompletionChunk>) {
          if (ended) break;
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          (res as unknown as { flush?: () => void }).flush?.();
        }
        if (!ended) res.write("data: [DONE]\n\n");
      } catch (err: unknown) {
        const message = (err as { message?: string }).message ?? "Unknown error";
        logger.error({ model: requestedModel, message }, "bedrock stream error");
        if (!ended) {
          res.write(`data: ${JSON.stringify({ error: { message, type: "proxy_error" } })}\n\n`);
          res.write("data: [DONE]\n\n");
        }
      } finally {
        safeEnd();
      }
      return;
    }

    // Non-streaming bedrock
    try {
      const response = await or.chat.completions.create({
        ...orParams,
        stream: false,
      } as unknown as OpenAI.ChatCompletionCreateParamsNonStreaming);
      res.json(response);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status ?? 500;
      const message = (err as { message?: string }).message ?? "Unknown error";
      logger.error({ model: requestedModel, status, message }, "bedrock error");
      res.status(status).json({ error: { message, type: "proxy_error" } });
    }
    return;
  }

  // ── OpenAI / Anthropic (existing routing) ─────────────────────────────────
  const mapping = MODEL_MAP[requestedModel];
  if (!mapping) {
    res.status(400).json({
      error: { message: `未知模型: ${requestedModel}`, type: "proxy_error" },
    });
    return;
  }

  function buildAnthropicParams(stream: boolean) {
    const systemMessages = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n");

    let nonSystemMessages = messages.filter(
      (m) => m.role === "user" || m.role === "assistant",
    );

    if (nonSystemMessages.length === 0 || nonSystemMessages[0]?.role === "assistant") {
      nonSystemMessages = [{ role: "user", content: "(continue)" }, ...nonSystemMessages];
    }

    const anthropicMessages = nonSystemMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const clientMaxTokens = body.max_tokens ?? body.max_completion_tokens;
    const maxTokens = clientMaxTokens && clientMaxTokens > 0 ? clientMaxTokens : 16384;

    const params: Parameters<typeof anthropic.messages.create>[0] = {
      model: mapping.realModel,
      max_tokens: maxTokens,
      messages: anthropicMessages,
      stream,
    };

    if (systemMessages) params.system = systemMessages;

    if (mapping.realModel !== "claude-opus-4-7" && body.temperature != null) {
      params.temperature = body.temperature as number;
    }

    return params;
  }

  if (isStream) {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const keepaliveInterval = setInterval(() => {
      try { res.write(": keepalive\n\n"); } catch (_) { /* ignore */ }
    }, 5000);

    let ended = false;
    function safeEnd() {
      if (!ended) {
        ended = true;
        clearInterval(keepaliveInterval);
        try { res.end(); } catch (_) { /* ignore if already closed */ }
      }
    }

    res.on("close", () => {
      ended = true;
      clearInterval(keepaliveInterval);
    });

    try {
      if (mapping.provider === "openai") {
        const openaiParams: Parameters<typeof openai.chat.completions.create>[0] = {
          model: mapping.realModel,
          messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
          stream: true,
        };
        if (body.max_completion_tokens != null) {
          openaiParams.max_completion_tokens = body.max_completion_tokens;
        } else if (body.max_tokens != null) {
          openaiParams.max_completion_tokens = body.max_tokens;
        }
        if (!OPENAI_NO_TEMP.has(mapping.realModel) && body.temperature != null) {
          openaiParams.temperature = body.temperature;
        }

        const stream = await openai.chat.completions.create(openaiParams);
        for await (const chunk of stream) {
          if (ended) break;
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          (res as unknown as { flush?: () => void }).flush?.();
        }
        if (!ended) res.write("data: [DONE]\n\n");
      } else {
        const anthropicParams = buildAnthropicParams(false);
        logger.info({ model: requestedModel, max_tokens: anthropicParams.max_tokens }, "anthropic stream request");

        const stream = anthropic.messages.stream(
          anthropicParams as Parameters<typeof anthropic.messages.stream>[0],
        );

        let stopReason: string | null = null;

        for await (const event of stream) {
          if (ended) break;

          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const chunk = {
              id: `chatcmpl-${Date.now()}`,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: requestedModel,
              choices: [{ index: 0, delta: { content: event.delta.text }, finish_reason: null }],
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            (res as unknown as { flush?: () => void }).flush?.();
          } else if (event.type === "message_delta") {
            stopReason = event.delta.stop_reason ?? null;
            logger.info({ model: requestedModel, stop_reason: stopReason, output_tokens: event.usage?.output_tokens }, "anthropic message_delta");
          }
        }

        if (!ended) {
          const finishReason = stopReason === "max_tokens" ? "length" : "stop";
          if (stopReason === "max_tokens") {
            logger.warn({ model: requestedModel }, "anthropic hit max_tokens limit — response truncated");
          }
          const finalChunk = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: requestedModel,
            choices: [{ index: 0, delta: {}, finish_reason: finishReason }],
          };
          res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
          res.write("data: [DONE]\n\n");
        }
      }
    } catch (err: unknown) {
      const status = (err as { status?: number }).status ?? 500;
      const message = (err as { message?: string }).message ?? "Unknown error";
      logger.error({ model: requestedModel, status, message }, "proxy stream error");
      if (!ended) {
        const errChunk = { error: { message, type: "proxy_error" } };
        res.write(`data: ${JSON.stringify(errChunk)}\n\n`);
        res.write("data: [DONE]\n\n");
      }
    } finally {
      safeEnd();
    }
    return;
  }

  // Non-streaming OpenAI / Anthropic
  try {
    if (mapping.provider === "openai") {
      const openaiParams: Parameters<typeof openai.chat.completions.create>[0] = {
        model: mapping.realModel,
        messages: messages as Parameters<typeof openai.chat.completions.create>[0]["messages"],
        stream: false,
      };
      if (body.max_completion_tokens != null) {
        openaiParams.max_completion_tokens = body.max_completion_tokens;
      } else if (body.max_tokens != null) {
        openaiParams.max_completion_tokens = body.max_tokens;
      }
      if (!OPENAI_NO_TEMP.has(mapping.realModel) && body.temperature != null) {
        openaiParams.temperature = body.temperature;
      }
      const response = await openai.chat.completions.create(openaiParams);
      res.json(response);
    } else {
      const anthropicParams = buildAnthropicParams(false);
      logger.info({ model: requestedModel, max_tokens: anthropicParams.max_tokens }, "anthropic non-stream request");

      const response = await anthropic.messages.create(anthropicParams);
      logger.info({ model: requestedModel, stop_reason: response.stop_reason, output_tokens: response.usage.output_tokens }, "anthropic non-stream response");

      const textBlock = response.content.find((b) => b.type === "text");
      const text = textBlock?.type === "text" ? textBlock.text : "";
      const finishReason = response.stop_reason === "max_tokens" ? "length" : "stop";

      res.json({
        id: response.id,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: requestedModel,
        choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: finishReason }],
        usage: {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      });
    }
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500;
    const message = (err as { message?: string }).message ?? "Unknown error";
    logger.error({ model: requestedModel, status, message }, "proxy error");
    res.status(status).json({ error: { message, type: "proxy_error" } });
  }
});

export default router;
