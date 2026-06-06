import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postTts } from "@/app/api/elevenlabs/tts/route";
import { POST as postTimestamps } from "@/app/api/elevenlabs/tts-with-timestamps/route";
import { POST as postCommand } from "@/app/api/llm/command/route";
import { POST as postStudy } from "@/app/api/llm/study/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("provider API routes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns audio/mpeg from the ElevenLabs TTS route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([7, 8]), {
          status: 200,
          headers: { "content-type": "audio/mpeg" }
        })
      )
    );

    const response = await postTts(
      jsonRequest({
        apiKey: "eleven-key",
        text: "Bonjour.",
        voiceId: "voice-1",
        modelId: "eleven_flash_v2_5"
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("audio/mpeg");
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([7, 8]);
  });

  it("returns timingAvailable false when ElevenLabs omits alignment", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ audio_base64: "abc" })));

    const response = await postTimestamps(
      jsonRequest({
        apiKey: "eleven-key",
        text: "Bonjour.",
        voiceId: "voice-1",
        modelId: "eleven_flash_v2_5"
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      audioBase64: "abc",
      timingAvailable: false,
      alignment: null,
      normalizedAlignment: null
    });
  });

  it("validates LLM command output before returning it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            {
              message: {
                content: "{\"action\":\"translate\",\"target\":{\"mode\":\"whole_sentence\"},\"confidence\":0.92}"
              }
            }
          ]
        })
      )
    );

    const response = await postCommand(
      jsonRequest({
        provider: "openai",
        apiKey: "openai-key",
        model: "gpt-4o-mini",
        transcript: "LangStop translate",
        readerState: {
          currentSentence: "Bonjour.",
          isPaused: false,
          noteMode: false
        }
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      action: "translate",
      target: { mode: "whole_sentence" },
      confidence: 0.92
    });
  });

  it("validates LLM study output before returning it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            {
              message: {
                content:
                  "{\"type\":\"translation\",\"translation\":\"Hello\",\"targetTerms\":[],\"flashcards\":[]}"
              }
            }
          ]
        })
      )
    );

    const response = await postStudy(
      jsonRequest({
        provider: "openai",
        apiKey: "openai-key",
        model: "gpt-4o-mini",
        targetLanguage: "English",
        intent: "translate",
        target: { mode: "whole_sentence" },
        sentence: "Bonjour."
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      type: "translation",
      translation: "Hello",
      targetTerms: [],
      flashcards: []
    });
  });

  it("returns safe errors for invalid requests and provider failures", async () => {
    const invalid = await postStudy(jsonRequest({ provider: "openai" }));
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toEqual({ error: "Invalid request." });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ error: "quota and secret details" }, { status: 401 }))
    );

    const failed = await postCommand(
      jsonRequest({
        provider: "openai",
        apiKey: "openai-key",
        model: "gpt-4o-mini",
        transcript: "LangStop translate",
        readerState: {
          currentSentence: "Bonjour.",
          isPaused: false,
          noteMode: false
        }
      })
    );

    expect(failed.status).toBe(502);
    expect(await failed.json()).toEqual({
      error: "Provider request failed. Check your key, quota, and provider settings."
    });
  });
});

