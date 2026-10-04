// Groq, Cerebras and Gemini all speak the OpenAI chat-completions protocol, so one fetch covers them.
export type Message = { role: "system" | "user"; content: string };

export type Provider = { name: string; baseUrl: string; apiKey: string; model: string };

const TIMEOUT_MS = 8000;

// Models can be swapped from the environment without a deploy of new code (free tiers change often).
const KNOWN: Record<string, { baseUrl: string; keyVar: string; modelVar: string; model: string }> = {
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    keyVar: "GEMINI_API_KEY",
    modelVar: "GEMINI_MODEL",
    model: "gemini-3.8-flash",
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    keyVar: "GROQ_API_KEY",
    modelVar: "GROQ_MODEL",
    model: "openai/gpt-oss-120b",
  },
  cerebras: {
    baseUrl: "https://api.cerebras.ai/v1",
    keyVar: "CEREBRAS_API_KEY",
    modelVar: "CEREBRAS_MODEL",
    model: "llama3.1-8b",
  },
};

// Providers in AI_PROVIDERS order (default gemini,groq,cerebras), skipping any without an API key.
export function configuredProviders(env: Record<string, string | undefined> = process.env): Provider[] {
  const order = (env.AI_PROVIDERS ?? "gemini,groq,cerebras").split(",").map((s) => s.trim()).filter(Boolean);
  return order.flatMap((name) => {
    const k = KNOWN[name];
    const apiKey = k && env[k.keyVar];
    return k && apiKey ? [{ name, baseUrl: k.baseUrl, apiKey, model: env[k.modelVar] || k.model }] : [];
  });
}

async function callProvider(p: Provider, messages: Message[], fetchFn: typeof fetch): Promise<string> {
  const res = await fetchFn(`${p.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
    body: JSON.stringify({ model: p.model, messages, temperature: 0.3, max_tokens: 800 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${p.name} responded ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`${p.name} returned no text`);
  return text;
}

export class NoProviderError extends Error {}

// Tries each provider in turn; rate limits, outages and empty replies fall through to the next one.
export async function complete(
  messages: Message[],
  providers: Provider[] = configuredProviders(),
  fetchFn: typeof fetch = fetch
): Promise<{ text: string; provider: string }> {
  if (providers.length === 0) throw new NoProviderError("No AI provider is configured");
  const errors: string[] = [];
  for (const p of providers) {
    try {
      return { text: await callProvider(p, messages, fetchFn), provider: p.name };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}
