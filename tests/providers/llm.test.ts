import { describe, expect, it, vi } from "vitest";
import { callJsonLlm } from "@/providers";

describe("LLM provider adapter", () => {
  it("calls OpenAI-compatible providers and parses JSON message content", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                action: "translate",
                target: { mode: "whole_sentence" },
                confidence: 0.9
              })
            }
          }
        ]
      })
    );

    const result = await callJsonLlm(
      {
        provider: "deepseek",
        apiKey: "deepseek-key",
        model: "deepseek-chat",
        systemPrompt: "Return JSON.",
        userPrompt: "LangStop translate"
      },
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer deepseek-key",
          "content-type": "application/json"
        })
      })
    );
    expect(result).toEqual({
      action: "translate",
      target: { mode: "whole_sentence" },
      confidence: 0.9
    });
  });

  it("uses a custom OpenAI-compatible base URL", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{ message: { content: "{\"type\":\"translation\",\"targetTerms\":[]}" } }]
      })
    );

    await callJsonLlm(
      {
        provider: "custom",
        apiKey: "custom-key",
        model: "custom-model",
        baseUrl: "https://llm.example.test/v1",
        systemPrompt: "Return JSON.",
        userPrompt: "Translate."
      },
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://llm.example.test/v1/chat/completions",
      expect.any(Object)
    );
  });

  it("calls Claude with the Anthropic messages envelope", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        content: [{ type: "text", text: "{\"action\":\"resume\",\"confidence\":0.9}" }]
      })
    );

    const result = await callJsonLlm(
      {
        provider: "claude",
        apiKey: "claude-key",
        model: "claude-sonnet",
        systemPrompt: "Return JSON.",
        userPrompt: "resume"
      },
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-key": "claude-key",
          "anthropic-version": "2023-06-01"
        })
      })
    );
    expect(result).toEqual({ action: "resume", confidence: 0.9 });
  });

  it("calls Gemini with generateContent and parses text JSON", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        candidates: [
          {
            content: {
              parts: [{ text: "{\"action\":\"bookmark\",\"confidence\":0.8}" }]
            }
          }
        ]
      })
    );

    const result = await callJsonLlm(
      {
        provider: "gemini",
        apiKey: "gemini-key",
        model: "gemini-2.0-flash",
        systemPrompt: "Return JSON.",
        userPrompt: "bookmark"
      },
      fetcher
    );

    expect(fetcher).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=gemini-key",
      expect.any(Object)
    );
    expect(result).toEqual({ action: "bookmark", confidence: 0.8 });
  });
});

