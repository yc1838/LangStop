export interface ReaderPreferences {
  provider: string;
  model: string;
  nativeLanguage: string;
  voiceId: string;
  rememberKeys: boolean;
}

export interface ProviderKeys {
  elevenLabsApiKey?: string;
  llmApiKey?: string;
}

export interface SettingsStorage {
  localStorage: Storage;
  sessionStorage: Storage;
}

const preferencesKey = "langstop.preferences";
const providerKeysKey = "langstop.providerKeys";

function readJson<T>(storage: Storage, key: string, fallback: T): T {
  const raw = storage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(storage: Storage, key: string, value: unknown): void {
  storage.setItem(key, JSON.stringify(value));
}

export function createSettingsStore({ localStorage, sessionStorage }: SettingsStorage) {
  return {
    savePreferences(preferences: ReaderPreferences): void {
      writeJson(localStorage, preferencesKey, preferences);
    },

    loadPreferences(): ReaderPreferences | null {
      return readJson<ReaderPreferences | null>(localStorage, preferencesKey, null);
    },

    saveProviderKeys(keys: ProviderKeys, options: { rememberKeys: boolean }): void {
      if (options.rememberKeys) {
        sessionStorage.removeItem(providerKeysKey);
        writeJson(localStorage, providerKeysKey, keys);
        return;
      }

      localStorage.removeItem(providerKeysKey);
      writeJson(sessionStorage, providerKeysKey, keys);
    },

    loadProviderKeys(): ProviderKeys {
      const sessionKeys = readJson<ProviderKeys>(sessionStorage, providerKeysKey, {});
      if (Object.keys(sessionKeys).length > 0) {
        return sessionKeys;
      }

      return readJson<ProviderKeys>(localStorage, providerKeysKey, {});
    },

    clearProviderKeys(): void {
      sessionStorage.removeItem(providerKeysKey);
      localStorage.removeItem(providerKeysKey);
    }
  };
}

