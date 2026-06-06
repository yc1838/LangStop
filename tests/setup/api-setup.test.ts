import { describe, expect, it } from "vitest";
import { createSettingsStore } from "@/data";
import {
  clearApiSetupKeys,
  defaultApiSetupPreferences,
  loadApiSetup,
  saveApiSetup
} from "@/setup/api-setup";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("API setup model", () => {
  it("loads Quiet Library defaults when no preferences have been saved", () => {
    const store = createSettingsStore({
      localStorage: new MemoryStorage(),
      sessionStorage: new MemoryStorage()
    });

    expect(loadApiSetup(store)).toEqual({
      preferences: defaultApiSetupPreferences,
      keys: {},
      hasElevenLabsKey: false,
      hasLlmKey: false
    });
  });

  it("saves preferences and keeps keys session-only by default", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    const store = createSettingsStore({ localStorage, sessionStorage });

    saveApiSetup(store, {
      preferences: {
        ...defaultApiSetupPreferences,
        provider: "openai",
        model: "gpt-4o-mini",
        rememberKeys: false
      },
      keys: {
        elevenLabsApiKey: "eleven-session",
        llmApiKey: "llm-session"
      }
    });

    expect(loadApiSetup(store).keys).toEqual({
      elevenLabsApiKey: "eleven-session",
      llmApiKey: "llm-session"
    });
    expect(
      loadApiSetup(
        createSettingsStore({
          localStorage,
          sessionStorage: new MemoryStorage()
        })
      ).keys
    ).toEqual({});
  });

  it("persists keys only when remember keys is enabled", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    const store = createSettingsStore({ localStorage, sessionStorage });

    saveApiSetup(store, {
      preferences: {
        ...defaultApiSetupPreferences,
        rememberKeys: true
      },
      keys: {
        elevenLabsApiKey: "eleven-local",
        llmApiKey: "llm-local"
      }
    });

    const nextSession = createSettingsStore({
      localStorage,
      sessionStorage: new MemoryStorage()
    });

    expect(loadApiSetup(nextSession).keys).toEqual({
      elevenLabsApiKey: "eleven-local",
      llmApiKey: "llm-local"
    });
  });

  it("clears setup keys without clearing non-secret preferences", () => {
    const store = createSettingsStore({
      localStorage: new MemoryStorage(),
      sessionStorage: new MemoryStorage()
    });

    saveApiSetup(store, {
      preferences: {
        ...defaultApiSetupPreferences,
        provider: "claude",
        model: "claude-sonnet",
        rememberKeys: true
      },
      keys: {
        elevenLabsApiKey: "eleven-local",
        llmApiKey: "llm-local"
      }
    });
    clearApiSetupKeys(store);

    expect(loadApiSetup(store)).toEqual({
      preferences: {
        ...defaultApiSetupPreferences,
        provider: "claude",
        model: "claude-sonnet",
        rememberKeys: true
      },
      keys: {},
      hasElevenLabsKey: false,
      hasLlmKey: false
    });
  });
});

