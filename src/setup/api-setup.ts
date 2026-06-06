import type { ProviderKeys, ReaderPreferences } from "@/data";

export interface SettingsStore {
  savePreferences(preferences: ReaderPreferences): void;
  loadPreferences(): ReaderPreferences | null;
  saveProviderKeys(keys: ProviderKeys, options: { rememberKeys: boolean }): void;
  loadProviderKeys(): ProviderKeys;
  clearProviderKeys(): void;
}

export interface ApiSetupState {
  preferences: ReaderPreferences;
  keys: ProviderKeys;
  hasElevenLabsKey: boolean;
  hasLlmKey: boolean;
}

export const defaultApiSetupPreferences: ReaderPreferences = {
  provider: "deepseek",
  model: "deepseek-chat",
  nativeLanguage: "English",
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  rememberKeys: false
};

export function loadApiSetup(store: SettingsStore): ApiSetupState {
  const preferences = store.loadPreferences() ?? defaultApiSetupPreferences;
  const keys = store.loadProviderKeys();

  return {
    preferences,
    keys,
    hasElevenLabsKey: Boolean(keys.elevenLabsApiKey),
    hasLlmKey: Boolean(keys.llmApiKey)
  };
}

export function saveApiSetup(
  store: SettingsStore,
  setup: {
    preferences: ReaderPreferences;
    keys: ProviderKeys;
  }
): void {
  store.savePreferences(setup.preferences);
  store.saveProviderKeys(setup.keys, { rememberKeys: setup.preferences.rememberKeys });
}

export function clearApiSetupKeys(store: SettingsStore): void {
  store.clearProviderKeys();
}

