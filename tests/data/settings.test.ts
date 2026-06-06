import { describe, expect, it } from "vitest";
import { createSettingsStore } from "@/data";

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

describe("settings storage", () => {
  it("persists non-secret preferences in local storage", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    const store = createSettingsStore({ localStorage, sessionStorage });

    store.savePreferences({
      provider: "deepseek",
      model: "deepseek-chat",
      nativeLanguage: "English",
      voiceId: "charlotte",
      rememberKeys: false
    });

    const nextSession = createSettingsStore({
      localStorage,
      sessionStorage: new MemoryStorage()
    });

    expect(nextSession.loadPreferences()).toEqual({
      provider: "deepseek",
      model: "deepseek-chat",
      nativeLanguage: "English",
      voiceId: "charlotte",
      rememberKeys: false
    });
  });

  it("stores provider keys in session storage by default", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    const store = createSettingsStore({ localStorage, sessionStorage });

    store.saveProviderKeys(
      { elevenLabsApiKey: "eleven-session", llmApiKey: "llm-session" },
      { rememberKeys: false }
    );

    expect(store.loadProviderKeys()).toEqual({
      elevenLabsApiKey: "eleven-session",
      llmApiKey: "llm-session"
    });

    const nextSession = createSettingsStore({
      localStorage,
      sessionStorage: new MemoryStorage()
    });
    expect(nextSession.loadProviderKeys()).toEqual({});
  });

  it("persists provider keys only when remember keys is enabled", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    const store = createSettingsStore({ localStorage, sessionStorage });

    store.saveProviderKeys(
      { elevenLabsApiKey: "eleven-local", llmApiKey: "llm-local" },
      { rememberKeys: true }
    );

    const nextSession = createSettingsStore({
      localStorage,
      sessionStorage: new MemoryStorage()
    });

    expect(nextSession.loadProviderKeys()).toEqual({
      elevenLabsApiKey: "eleven-local",
      llmApiKey: "llm-local"
    });
  });

  it("clears provider keys from both session and local storage", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    const store = createSettingsStore({ localStorage, sessionStorage });

    store.saveProviderKeys({ elevenLabsApiKey: "secret" }, { rememberKeys: true });
    store.saveProviderKeys({ llmApiKey: "session-secret" }, { rememberKeys: false });
    store.clearProviderKeys();

    expect(store.loadProviderKeys()).toEqual({});
  });
});

