"use client";

import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Import,
  KeyRound,
  Loader2,
  Pause,
  Play,
  Settings,
  ShieldCheck,
  Trash2,
  Volume2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createLangStopDb,
  createSettingsStore,
  saveDocumentState,
  type LangStopDb,
  type ProviderKeys,
  type ReaderPreferences
} from "@/data";
import {
  createReaderState,
  getCurrentSentence,
  moveReaderPosition,
  playSentenceWithFallback,
  prepareTextImport,
  toReadingPosition,
  type ReaderState
} from "@/reader";
import {
  clearApiSetupKeys,
  defaultApiSetupPreferences,
  loadApiSetup,
  saveApiSetup
} from "@/setup/api-setup";

const sampleText =
  "Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n'avais pas le temps de me dire : Je m'endors. Et, une demi-heure après, la pensée qu'il était temps de chercher le sommeil m'éveillait.";

const defaultImport = prepareTextImport({
  id: "sample-proust",
  title: "Du côté de chez Swann",
  text: sampleText,
  now: new Date("2026-06-06T12:00:00.000Z").toISOString()
});

const providerOptions = [
  { id: "deepseek", label: "DeepSeek", model: "deepseek-chat" },
  { id: "kimi", label: "Kimi", model: "moonshot-v1-8k" },
  { id: "openai", label: "OpenAI", model: "gpt-4o-mini" },
  { id: "claude", label: "Claude", model: "claude-sonnet" },
  { id: "gemini", label: "Gemini", model: "gemini-2.0-flash" },
  { id: "custom", label: "Custom", model: "openai-compatible" }
] as const;

const voiceOptions = [
  { id: "JBFqnCBsd6RMkjVDRZzb", label: "Charlotte", meta: "Warm narration" },
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel", meta: "Clear studio voice" }
] as const;

function createBrowserTts() {
  return {
    speak(text: string, options: { rate: number }) {
      return new Promise<void>((resolve, reject) => {
        if (!("speechSynthesis" in window)) {
          reject(new Error("Speech synthesis is unavailable."));
          return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate;
        utterance.lang = "fr-FR";
        utterance.onend = () => resolve();
        utterance.onerror = () => reject(new Error("Speech synthesis failed."));
        window.speechSynthesis.speak(utterance);
        resolve();
      });
    }
  };
}

export function ReaderApp() {
  const [documentTitle, setDocumentTitle] = useState(defaultImport.document.title);
  const [readerState, setReaderState] = useState<ReaderState>(() =>
    createReaderState({
      documentId: defaultImport.document.id,
      sentences: defaultImport.sentences
    })
  );
  const [draftText, setDraftText] = useState(sampleText);
  const [setupOpen, setSetupOpen] = useState(true);
  const [preferences, setPreferences] = useState<ReaderPreferences>(defaultApiSetupPreferences);
  const [providerKeys, setProviderKeys] = useState<ProviderKeys>({});
  const [setupStatus, setSetupStatus] = useState("");
  const [speed, setSpeed] = useState(1);
  const [playback, setPlayback] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [playbackMessage, setPlaybackMessage] = useState("Browser voice ready.");
  const [importError, setImportError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dbRef = useRef<LangStopDb | null>(null);

  const currentSentence = getCurrentSentence(readerState);
  const progressLabel =
    readerState.sentences.length === 0
      ? "No sentences"
      : `Sentence ${readerState.currentSentenceIndex + 1} of ${readerState.sentences.length}`;

  const documentText = useMemo(
    () => readerState.sentences.map((sentence) => sentence.text).join(" "),
    [readerState.sentences]
  );

  const elevenLabsKey = providerKeys.elevenLabsApiKey ?? "";

  useEffect(() => {
    const setup = loadApiSetup(
      createSettingsStore({
        localStorage: window.localStorage,
        sessionStorage: window.sessionStorage
      })
    );
    setPreferences(setup.preferences);
    setProviderKeys(setup.keys);
    setSetupOpen(!setup.hasElevenLabsKey);
  }, []);

  function getDb() {
    dbRef.current ??= createLangStopDb();
    return dbRef.current;
  }

  async function persistPosition(nextState: ReaderState) {
    await saveDocumentState(getDb(), {
      document: {
        id: nextState.documentId,
        title: documentTitle,
        sourceType: "text",
        text: documentText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      position: toReadingPosition(nextState, new Date().toISOString())
    });
  }

  function stopPlayback() {
    audioRef.current?.pause();
    audioRef.current = null;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlayback("paused");
  }

  async function requestElevenLabsAudio(request: {
    apiKey: string;
    text: string;
    voiceId: string;
    modelId: string;
  }) {
    const response = await fetch("/api/elevenlabs/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error("ElevenLabs request failed.");
    }

    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audioRef.current = audio;
    audio.playbackRate = speed;
    await audio.play();
  }

  async function playCurrentSentence() {
    if (!currentSentence) return;
    setPlayback("loading");

    const result = await playSentenceWithFallback({
      sentence: currentSentence.text,
      elevenLabsKey,
      voiceId: preferences.voiceId,
      modelId: "eleven_flash_v2_5",
      speed,
      requestAudio: requestElevenLabsAudio,
      browserTts: createBrowserTts()
    });

    setPlayback("playing");
    setPlaybackMessage(result.message ?? "ElevenLabs voice playing.");
  }

  async function move(direction: "previous" | "next") {
    stopPlayback();
    const nextState = moveReaderPosition(readerState, direction);
    setReaderState(nextState);
    await persistPosition(nextState);
  }

  async function importDraft() {
    const text = draftText.trim();
    if (!text) {
      setImportError("Paste readable text before importing.");
      return;
    }

    const now = new Date().toISOString();
    const imported = prepareTextImport({
      id: `doc-${now}`,
      title: "Imported reading",
      text,
      now
    });

    if (imported.sentences.length === 0) {
      setImportError("No readable sentences were found.");
      return;
    }

    const nextState = createReaderState({
      documentId: imported.document.id,
      sentences: imported.sentences
    });
    await saveDocumentState(getDb(), {
      document: imported.document,
      position: imported.position
    });
    setDocumentTitle(imported.document.title);
    setReaderState(nextState);
    setImportError("");
    setPlaybackMessage("Imported text is ready.");
  }

  function saveSetup() {
    const store = createSettingsStore({
      localStorage: window.localStorage,
      sessionStorage: window.sessionStorage
    });
    saveApiSetup(store, {
      preferences,
      keys: providerKeys
    });
    setSetupStatus(
      preferences.rememberKeys
        ? "Saved. Keys will stay on this device."
        : "Saved for this browser session."
    );
    setPlaybackMessage(
      providerKeys.elevenLabsApiKey
        ? "ElevenLabs voice ready."
        : "No ElevenLabs key saved; browser voice will be used."
    );
    setSetupOpen(false);
  }

  function clearKeys() {
    const store = createSettingsStore({
      localStorage: window.localStorage,
      sessionStorage: window.sessionStorage
    });
    clearApiSetupKeys(store);
    setProviderKeys({});
    setSetupStatus("Keys cleared from this browser.");
    setPlaybackMessage("Browser voice ready.");
  }

  function updateProvider(provider: ReaderPreferences["provider"]) {
    const option = providerOptions.find((item) => item.id === provider);
    setPreferences((current) => ({
      ...current,
      provider,
      model: option?.model ?? current.model
    }));
  }

  return (
    <main className="reader-app">
      <header className="reader-topbar">
        <div className="brand-mark">
          <span className="brand-name">LangStop</span>
          <span className="brand-section">Reader</span>
        </div>
        <button className="provider-strip" onClick={() => setSetupOpen(true)}>
          <Volume2 size={16} aria-hidden="true" />
          <span>{elevenLabsKey ? "ElevenLabs ready" : "Browser voice"}</span>
          <span className="dot" aria-hidden="true" />
          <Settings size={16} aria-hidden="true" />
        </button>
      </header>

      {setupOpen && (
        <section className="setup-backdrop" aria-label="API setup window">
          <div className="setup-sheet">
            <div className="setup-head">
              <div>
                <span className="doc-kicker">Bring your own keys</span>
                <h2>Set up your reading desk</h2>
                <p>
                  Keys are session-only unless you enable remembering them on this device.
                </p>
              </div>
              <KeyRound size={26} aria-hidden="true" />
            </div>

            <div className="setup-grid">
              <label className="field-label" htmlFor="setup-eleven">
                ElevenLabs API key
              </label>
              <input
                id="setup-eleven"
                className="quiet-input"
                value={providerKeys.elevenLabsApiKey ?? ""}
                onChange={(event) =>
                  setProviderKeys((current) => ({
                    ...current,
                    elevenLabsApiKey: event.target.value
                  }))
                }
                placeholder="sk_..."
                type="password"
              />

              <div className="provider-grid" role="radiogroup" aria-label="LLM provider">
                {providerOptions.map((provider) => (
                  <button
                    key={provider.id}
                    className={
                      preferences.provider === provider.id
                        ? "provider-card selected"
                        : "provider-card"
                    }
                    onClick={() => updateProvider(provider.id)}
                    type="button"
                  >
                    <span>{provider.label}</span>
                    <small>{provider.model}</small>
                  </button>
                ))}
              </div>

              <label className="field-label" htmlFor="setup-llm">
                LLM API key
              </label>
              <input
                id="setup-llm"
                className="quiet-input"
                value={providerKeys.llmApiKey ?? ""}
                onChange={(event) =>
                  setProviderKeys((current) => ({
                    ...current,
                    llmApiKey: event.target.value
                  }))
                }
                placeholder="study model key"
                type="password"
              />

              <div className="setup-row">
                <label className="field-label" htmlFor="setup-model">
                  Model
                </label>
                <input
                  id="setup-model"
                  className="quiet-input"
                  value={preferences.model}
                  onChange={(event) =>
                    setPreferences((current) => ({ ...current, model: event.target.value }))
                  }
                />
              </div>

              <div className="setup-row">
                <label className="field-label" htmlFor="setup-language">
                  Native language
                </label>
                <input
                  id="setup-language"
                  className="quiet-input"
                  value={preferences.nativeLanguage}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      nativeLanguage: event.target.value
                    }))
                  }
                />
              </div>

              <div className="voice-grid" role="radiogroup" aria-label="Narration voice">
                {voiceOptions.map((voice) => (
                  <button
                    key={voice.id}
                    className={
                      preferences.voiceId === voice.id ? "voice-card selected" : "voice-card"
                    }
                    onClick={() =>
                      setPreferences((current) => ({ ...current, voiceId: voice.id }))
                    }
                    type="button"
                  >
                    <span>{voice.label}</span>
                    <small>{voice.meta}</small>
                  </button>
                ))}
              </div>

              <label className="remember-row">
                <input
                  checked={preferences.rememberKeys}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      rememberKeys: event.target.checked
                    }))
                  }
                  type="checkbox"
                />
                <span>Remember keys on this device</span>
              </label>
            </div>

            {setupStatus && <p className="setup-status">{setupStatus}</p>}

            <div className="setup-actions">
              <span className="setup-assurance">
                <ShieldCheck size={15} aria-hidden="true" />
                Keys never leave your browser except provider requests.
              </span>
              <button className="ghost-button" onClick={clearKeys} type="button">
                <Trash2 size={16} aria-hidden="true" />
                Clear keys
              </button>
              <button className="copper-button compact" onClick={saveSetup} type="button">
                Open the reader
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="reader-stage" aria-label="Reader workspace">
        <div className="reader-scroll">
          <article className="document-page" aria-label="Current document">
            <div className="doc-kicker">À la recherche du temps perdu</div>
            <h1>{documentTitle}</h1>
            <p className="doc-byline">Marcel Proust — reader sample</p>
            <div className="doc-rule" />
            <div className="sentence-list">
              {readerState.sentences.map((sentence) => (
                <span
                  key={sentence.id}
                  className={
                    sentence.index === readerState.currentSentenceIndex
                      ? "sentence active"
                      : "sentence"
                  }
                >
                  {sentence.text}{" "}
                </span>
              ))}
            </div>
          </article>

          <aside className="margin-note" aria-label="Playback status">
            <strong>The margin</strong>
            <span>{progressLabel}</span>
            <span>{playbackMessage}</span>
          </aside>
        </div>

        <aside className="study-tray" aria-label="Reader setup and study tray">
          <div className="tray-title">
            <BookOpenText size={15} aria-hidden="true" />
            Study Tray
          </div>
          <button className="setup-mini" onClick={() => setSetupOpen(true)} type="button">
            <KeyRound size={16} aria-hidden="true" />
            {elevenLabsKey ? "Voice key configured" : "Set up ElevenLabs"}
          </button>
          <label className="field-label" htmlFor="draft-text">
            Import plain text
          </label>
          <textarea
            id="draft-text"
            className="quiet-textarea"
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            rows={8}
          />
          {importError && <p className="import-error">{importError}</p>}
          <button className="copper-button" onClick={importDraft}>
            <Import size={16} aria-hidden="true" />
            Import text
          </button>
          <div className="tray-section">
            <span className="section-label">Due for review</span>
            <p>No cards yet. Study capture begins in the next phase.</p>
          </div>
        </aside>
      </section>

      <div className="playbar-wrap" aria-label="Playback controls">
        <div className="playbar">
          <button
            className="icon-button"
            onClick={() => void move("previous")}
            aria-label="Previous sentence"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="play-button"
            onClick={() =>
              playback === "playing" || playback === "loading"
                ? stopPlayback()
                : void playCurrentSentence()
            }
            aria-label={playback === "playing" || playback === "loading" ? "Pause" : "Play"}
          >
            {playback === "loading" ? (
              <Loader2 className="spin" size={22} />
            ) : playback === "playing" ? (
              <Pause size={22} />
            ) : (
              <Play size={22} />
            )}
          </button>
          <button
            className="icon-button"
            onClick={() => void move("next")}
            aria-label="Next sentence"
          >
            <ChevronRight size={22} />
          </button>
          <div className="play-meta">
            <span>{progressLabel}</span>
            <span>{playback === "loading" ? "Loading voice" : playbackMessage}</span>
          </div>
          <button
            className="speed-button"
            onClick={() => setSpeed((current) => (current >= 1.5 ? 0.75 : current + 0.25))}
          >
            {speed}x
          </button>
        </div>
      </div>
    </main>
  );
}
