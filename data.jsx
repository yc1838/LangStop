/* Shared icons + document data for LangStop */

const Icon = ({ name, size = 20, stroke = 1.7, ...rest }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest };
  const paths = {
    play: <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />,
    pause: <g><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></g>,
    prev: <g><polygon points="11 7 4 12 11 17 11 7" fill="currentColor" stroke="none"/><polygon points="20 7 13 12 20 17 20 7" fill="currentColor" stroke="none"/></g>,
    next: <g><polygon points="13 7 20 12 13 17 13 7" fill="currentColor" stroke="none"/><polygon points="4 7 11 12 4 17 4 7" fill="currentColor" stroke="none"/></g>,
    mic: <g><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></g>,
    translate: <g><path d="M4 5h7M8 4v1c0 3.5-2 6.5-5 8"/><path d="M5 10c1.5 2 3.5 3.5 5.5 4.5"/><path d="M13 20l4-9 4 9M14.5 17h5"/></g>,
    settings: <g><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></g>,
    upload: <g><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 9 12 4 17 9"/><line x1="12" y1="4" x2="12" y2="16"/></g>,
    book: <g><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 5.5v15A2.5 2.5 0 0 1 6.5 18H20"/></g>,
    bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>,
    note: <g><path d="M5 3h11l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><polyline points="15 3 15 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="16" x2="13" y2="16"/></g>,
    cards: <g><rect x="3" y="7" width="13" height="14" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2"/></g>,
    clock: <g><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></g>,
    close: <g><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g>,
    eye: <g><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></g>,
    eyeOff: <g><path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-3 3.8M6.6 6.6A18 18 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4-.7"/><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2"/><line x1="3" y1="3" x2="21" y2="21"/></g>,
    panelRight: <g><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="14" y1="4" x2="14" y2="20"/></g>,
    chevron: <polyline points="9 6 15 12 9 18"/>,
    sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>,
    volume: <g><polygon points="5 9 9 9 13 5 13 19 9 15 5 15 5 9" fill="currentColor" stroke="none"/><path d="M16 9a3 3 0 0 1 0 6"/></g>,
    check: <polyline points="4 12 9 17 20 6"/>,
    plus: <g><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></g>,
    explain: <g><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7"/><line x1="12" y1="16.5" x2="12" y2="16.5"/></g>,
    spell: <g><path d="M4 7V5h16v2"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="9" y1="19" x2="15" y2="19"/></g>,
    examples: <g><line x1="8" y1="7" x2="20" y2="7"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="17" x2="16" y2="17"/><circle cx="4" cy="7" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="17" r="1" fill="currentColor"/></g>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
};

/* ---- Providers & voices ---- */
const PROVIDERS = [
  { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat' },
  { id: 'kimi', name: 'Kimi', model: 'moonshot-v1-8k' },
  { id: 'openai', name: 'OpenAI', model: 'gpt-4o-mini' },
  { id: 'claude', name: 'Claude', model: 'claude-sonnet' },
  { id: 'gemini', name: 'Gemini', model: 'gemini-2.0-flash' },
  { id: 'custom', name: 'Custom', model: 'OpenAI-compatible' },
];

const VOICES = [
  { id: 'charlotte', name: 'Charlotte', desc: 'Warm · British', initial: 'C' },
  { id: 'amélie', name: 'Amélie', desc: 'Soft · French', initial: 'A' },
  { id: 'rafael', name: 'Rafael', desc: 'Clear · Neutral', initial: 'R' },
  { id: 'george', name: 'George', desc: 'Grave · Mature', initial: 'G' },
];

const LANGUAGES = ['English', 'Spanish', 'German', 'Italian', 'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Arabic'];

/* ---- The document: Proust, Du côté de chez Swann (public domain) ---- */
/* Each sentence carries its translation + an optional word-level gloss. */
const DOC = {
  kicker: 'À la recherche du temps perdu',
  title: 'Du côté de chez Swann',
  byline: 'Marcel Proust — Ouverture',
  lang: 'French',
  paragraphs: [
    [
      { fr: 'Longtemps, je me suis couché de bonne heure.', en: 'For a long time, I would go to bed early.' },
      { fr: 'Parfois, à peine ma bougie éteinte, mes yeux se fermaient si vite que je n’avais pas le temps de me dire : « Je m’endors. »', en: 'Sometimes, my candle scarcely out, my eyes would close so quickly that I had no time to tell myself: “I am falling asleep.”' },
      { fr: 'Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait.', en: 'And, half an hour later, the thought that it was time to seek sleep would wake me.' },
      { fr: 'Je voulais poser le volume que je croyais avoir encore dans les mains et souffler ma lumière.', en: 'I would want to put down the book I thought I still held in my hands, and blow out my light.' },
    ],
    [
      { fr: 'Je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire, mais ces réflexions avaient pris un tour un peu particulier.', en: 'I had not ceased, while sleeping, to reflect on what I had just read, but these reflections had taken a rather peculiar turn.' },
      { fr: 'Il me semblait que j’étais moi-même ce dont parlait l’ouvrage : une église, un quatuor, la rivalité de François Ier et de Charles Quint.', en: 'It seemed to me that I myself was what the book spoke of: a church, a quartet, the rivalry between François I and Charles V.', gloss: { word: 'quatuor', tr: 'quartet', pos: 'noun, masculine', note: 'A musical ensemble of four performers, or a composition for four voices or instruments.' } },
      { fr: 'Cette croyance survivait pendant quelques secondes à mon réveil ; elle ne choquait pas ma raison, mais pesait comme des écailles sur mes yeux.', en: 'This belief would survive for some seconds after I woke; it did not offend my reason, but lay like scales upon my eyes.' },
      { fr: 'Puis elle commençait à me devenir inintelligible, comme après la métempsycose les pensées d’une existence antérieure.', en: 'Then it would begin to grow unintelligible to me, like the thoughts of a former life after metempsychosis.' },
    ],
  ],
};

/* split a sentence into word tokens, keeping punctuation attached so spacing is natural */
function tokenize(text) {
  return text.match(/[^\s]+|\s+/g) || [];
}
function isWord(tok) { return /[A-Za-zÀ-ÿ’']/.test(tok); }

Object.assign(window, { Icon, PROVIDERS, VOICES, LANGUAGES, DOC, tokenize, isWord });
