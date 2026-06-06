import { ProviderRequestError } from "./errors";
import type { LlmProviderId } from "./schemas";

type Fetcher = typeof fetch;

export interface JsonLlmRequest {
  provider: LlmProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string;
  systemPrompt: string;
  userPrompt: string;
}

const openAiCompatibleBaseUrls: Record<Exclude<LlmProviderId, "claude" | "gemini" | "custom">, string> = {
  deepseek: "https://api.deepseek.com",
  kimi: "https://api.moonshot.ai/v1",
  openai: "https://api.openai.com/v1"
};

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function parseJsonText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new ProviderRequestError();
  }
}

async function fetchJson(fetcher: Fetcher, url: string, init: RequestInit): Promise<unknown> {
  const response = await fetcher(url, init);
  if (!response.ok) {
    throw new ProviderRequestError();
  }

  return response.json();
}

async function callOpenAiCompatible(
  request: JsonLlmRequest,
  fetcher: Fetcher
): Promise<unknown> {
  const baseUrl =
    request.provider === "custom"
      ? request.baseUrl
      : openAiCompatibleBaseUrls[request.provider as keyof typeof openAiCompatibleBaseUrls];

  if (!baseUrl) {
    throw new ProviderRequestError();
  }

  const json = (await fetchJson(fetcher, joinUrl(baseUrl, "/chat/completions"), {
    method: "POST",
    headers: {
      authorization: `Bearer ${request.apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  })) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new ProviderRequestError();
  }

  return parseJsonText(content);
}

async function callClaude(request: JsonLlmRequest, fetcher: Fetcher): Promise<unknown> {
  const json = (await fetchJson(fetcher, "https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": request.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: request.model,
      max_tokens: 1000,
      temperature: 0.2,
      system: request.systemPrompt,
      messages: [{ role: "user", content: request.userPrompt }]
    })
  })) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const content = json.content?.find((part) => part.type === "text" && part.text)?.text;
  if (!content) {
    throw new ProviderRequestError();
  }

  return parseJsonText(content);
}

async function callGemini(request: JsonLlmRequest, fetcher: Fetcher): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    request.model
  )}:generateContent?key=${encodeURIComponent(request.apiKey)}`;

  const json = (await fetchJson(fetcher, url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${request.systemPrompt}\n\n${request.userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  })) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const content = json.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
  if (!content) {
    throw new ProviderRequestError();
  }

  return parseJsonText(content);
}

export async function callJsonLlm(
  request: JsonLlmRequest,
  fetcher: Fetcher = fetch
): Promise<unknown> {
  if (request.provider === "claude") {
    return callClaude(request, fetcher);
  }

  if (request.provider === "gemini") {
    return callGemini(request, fetcher);
  }

  return callOpenAiCompatible(request, fetcher);
}

