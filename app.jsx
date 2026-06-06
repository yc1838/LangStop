/* LangStop — main app */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "highlight": "wash",
  "texture": "subtle",
  "docSize": 21,
  "lineHeight": 1.92,
  "accent": "#b06434"
}/*EDITMODE-END*/;

/* FR→EN gloss for word-tap demo — covers the visible passage */
const WORD_GLOSS = {
  longtemps: { tr: 'for a long time', pos: 'adverb' },
  je: { tr: 'I', pos: 'pronoun' }, me: { tr: 'myself', pos: 'pronoun' },
  suis: { tr: '(I) am', pos: 'verb · être' }, couché: { tr: 'lay down; went to bed', pos: 'past participle' },
  de: { tr: 'of; from', pos: 'preposition' }, bonne: { tr: 'good; early', pos: 'adjective, fem.' },
  heure: { tr: 'hour; o’clock', pos: 'noun, feminine' },
  parfois: { tr: 'sometimes', pos: 'adverb' }, bougie: { tr: 'candle', pos: 'noun, feminine' },
  éteinte: { tr: 'extinguished; out', pos: 'past participle' }, yeux: { tr: 'eyes', pos: 'noun, masc. pl.' },
  fermaient: { tr: 'would close', pos: 'verb · fermer' }, vite: { tr: 'quickly', pos: 'adverb' },
  temps: { tr: 'time', pos: 'noun, masculine' }, dire: { tr: 'to say; to tell', pos: 'verb' },
  endors: { tr: 'fall asleep', pos: 'verb · s’endormir' }, pensée: { tr: 'thought', pos: 'noun, feminine' },
  chercher: { tr: 'to seek; to look for', pos: 'verb' }, sommeil: { tr: 'sleep', pos: 'noun, masculine' },
  voulais: { tr: 'wanted', pos: 'verb · vouloir' }, poser: { tr: 'to put down', pos: 'verb' },
  volume: { tr: 'volume; book', pos: 'noun, masculine' }, croyais: { tr: 'believed; thought', pos: 'verb · croire' },
  mains: { tr: 'hands', pos: 'noun, fem. pl.' }, souffler: { tr: 'to blow out', pos: 'verb' },
  lumière: { tr: 'light', pos: 'noun, feminine' },
  réflexions: { tr: 'reflections; thoughts', pos: 'noun, fem. pl.' }, lire: { tr: 'to read', pos: 'verb' },
  particulier: { tr: 'peculiar; particular', pos: 'adjective' }, ouvrage: { tr: 'work; book', pos: 'noun, masculine' },
  église: { tr: 'church', pos: 'noun, feminine' }, quatuor: { tr: 'quartet', pos: 'noun, masculine' },
  rivalité: { tr: 'rivalry', pos: 'noun, feminine' }, croyance: { tr: 'belief', pos: 'noun, feminine' },
  secondes: { tr: 'seconds', pos: 'noun, fem. pl.' }, raison: { tr: 'reason', pos: 'noun, feminine' },
  écailles: { tr: 'scales', pos: 'noun, fem. pl.' }, réveil: { tr: 'waking; awakening', pos: 'noun, masculine' },
  pensées: { tr: 'thoughts', pos: 'noun, fem. pl.' }, existence: { tr: 'existence; life', pos: 'noun, feminine' },
  antérieure: { tr: 'former; earlier', pos: 'adjective, fem.' },
  à: { tr: 'to; at', pos: 'preposition' }, ma: { tr: 'my', pos: 'possessive' }, mes: { tr: 'my', pos: 'possessive, pl.' },
  mon: { tr: 'my', pos: 'possessive, masc.' }, si: { tr: 'so; if', pos: 'adverb' }, que: { tr: 'that; which', pos: 'conjunction' },
  il: { tr: 'it; he', pos: 'pronoun' }, elle: { tr: 'she; it', pos: 'pronoun' }, la: { tr: 'the; her', pos: 'article' },
  le: { tr: 'the; it', pos: 'article' }, les: { tr: 'the', pos: 'article, pl.' }, des: { tr: 'some; of the', pos: 'article' },
  ne: { tr: 'not (negation)', pos: 'particle' }, pas: { tr: 'not', pos: 'adverb' }, comme: { tr: 'like; as', pos: 'conjunction' },
  puis: { tr: 'then', pos: 'adverb' }, et: { tr: 'and', pos: 'conjunction' }, une: { tr: 'a; one', pos: 'article, fem.' },
  un: { tr: 'a; one', pos: 'article, masc.' }, après: { tr: 'after', pos: 'preposition' }, encore: { tr: 'still; again', pos: 'adverb' },
  dans: { tr: 'in; inside', pos: 'preposition' }, ce: { tr: 'this; that', pos: 'demonstrative' }, sur: { tr: 'on; upon', pos: 'preposition' },
  mais: { tr: 'but', pos: 'conjunction' }, pendant: { tr: 'during; for', pos: 'preposition' }, avaient: { tr: 'had', pos: 'verb · avoir' },
  pris: { tr: 'taken', pos: 'past participle' }, tour: { tr: 'turn', pos: 'noun, masculine' }, peu: { tr: 'little; few', pos: 'adverb' },
  semblait: { tr: 'seemed', pos: 'verb · sembler' }, parlait: { tr: 'spoke of', pos: 'verb · parler' },
  survivait: { tr: 'would survive', pos: 'verb · survivre' }, choquait: { tr: 'offended; shocked', pos: 'verb · choquer' },
  pesait: { tr: 'weighed; lay', pos: 'verb · peser' }, commençait: { tr: 'began', pos: 'verb · commencer' },
  devenir: { tr: 'to become', pos: 'verb' }, inintelligible: { tr: 'unintelligible', pos: 'adjective' },
  métempsycose: { tr: 'metempsychosis', pos: 'noun, feminine' }, cette: { tr: 'this', pos: 'demonstrative, fem.' },
};

let _id = 100;
const uid = () => ++_id;

function flatten() {
  const list = [];
  DOC.paragraphs.forEach((para, gi) => para.forEach((s, si) => list.push({ gi, si, s })));
  return list;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const flat = React.useMemo(flatten, []);
  const total = flat.length;
  const indexOf = (gi, si) => flat.findIndex(f => f.gi === gi && f.si === si);

  // setup / config
  const [config, setConfig] = React.useState(() => {
    try { const s = localStorage.getItem('langstop.config'); if (s) return JSON.parse(s); } catch (e) {}
    return null;
  });
  const [setupOpen, setSetupOpen] = React.useState(() => {
    try { return !localStorage.getItem('langstop.config'); } catch (e) { return true; }
  });

  // reading state
  const [active, setActive] = React.useState({ gi: 0, si: 0 });
  const [playing, setPlaying] = React.useState(false);
  const [speedIdx, setSpeedIdx] = React.useState(1);
  const [selectedWord, setSelectedWord] = React.useState(null);

  // ai layer
  const [translating, setTranslating] = React.useState(null);  // {gi,si}
  const [annotation, setAnnotation] = React.useState(null);

  // voice command
  const [listening, setListening] = React.useState(false);
  const [heard, setHeard] = React.useState('');

  // tray
  const [trayCollapsed, setTrayCollapsed] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState([]);
  const [notes, setNotes] = React.useState([]);
  const [translations, setTranslations] = React.useState([]);
  const [cards, setCards] = React.useState([]);
  const due = [
    { id: 1, front: 'le sommeil', when: 'now' },
    { id: 2, front: 'la bougie', when: '2h' },
    { id: 3, front: "s'endormir", when: 'today' },
  ];

  const speed = SPEEDS[speedIdx];
  const sentenceLabel = `Sentence ${indexOf(active.gi, active.si) + 1} of ${total}`;

  // auto-advance while playing
  React.useEffect(() => {
    if (!playing) return;
    const ms = 3600 / speed;
    const tmr = setTimeout(() => {
      const i = indexOf(active.gi, active.si);
      if (i < total - 1) {
        setActive({ gi: flat[i + 1].gi, si: flat[i + 1].si });
        setSelectedWord(null);
      } else {
        setPlaying(false);
      }
    }, ms);
    return () => clearTimeout(tmr);
  }, [playing, active, speed]);

  function completeSetup(cfg) {
    setConfig(cfg);
    setSetupOpen(false);
    try {
      if (cfg.remember) localStorage.setItem('langstop.config', JSON.stringify(cfg));
      else localStorage.setItem('langstop.config', JSON.stringify({ ...cfg, eleven: '', llmKey: '' }));
    } catch (e) {}
  }

  function goPrev() {
    const i = indexOf(active.gi, active.si);
    if (i > 0) { setActive({ gi: flat[i - 1].gi, si: flat[i - 1].si }); setSelectedWord(null); clearAnno(); }
  }
  function goNext() {
    const i = indexOf(active.gi, active.si);
    if (i < total - 1) { setActive({ gi: flat[i + 1].gi, si: flat[i + 1].si }); setSelectedWord(null); clearAnno(); }
  }
  function clearAnno() { setAnnotation(null); setTranslating(null); }

  function selectSentence(gi, si) {
    setActive({ gi, si }); setSelectedWord(null);
    if (!(translating && translating.gi === gi && translating.si === si)) clearAnno();
  }

  // ----- translate whole sentence -----
  function translateSentence(target) {
    const tg = target || active;
    const s = DOC.paragraphs[tg.gi][tg.si];
    setActive(tg);
    setPlaying(false);
    setTranslating(tg);
    setSelectedWord(null);
    const trId = uid();
    const anno = {
      mode: 'sentence', src: s.fr, tr: s.en, carded: false,
      onCard: () => addCard(s.fr.slice(0, 40) + (s.fr.length > 40 ? '…' : ''), s.en, anno),
    };
    setAnnotation(anno);
    setTranslations(prev => [{ id: trId, src: clip(s.fr), tr: clip(s.en), mode: 'sentence', provider: provName() }, ...prev].slice(0, 6));
  }

  // ----- translate a single word -----
  function selectWord(gi, si, idx, text) {
    setActive({ gi, si });
    setSelectedWord(idx);
    setPlaying(false);
    setTranslating({ gi, si });
    const key = (text || '').toLowerCase();
    const g = WORD_GLOSS[key];
    const s = DOC.paragraphs[gi][si];
    const sentenceGloss = s.gloss && s.gloss.word === key ? s.gloss : null;
    const tr = g ? g.tr : (sentenceGloss ? sentenceGloss.tr : 'tap Explain for context');
    const pos = g ? g.pos : (sentenceGloss ? sentenceGloss.pos : 'word');
    const note = sentenceGloss ? sentenceGloss.note : null;
    const anno = {
      mode: 'word', src: text, tr, pos, note, carded: false,
      onCard: () => addCard(text, tr, anno),
    };
    setAnnotation(anno);
    setTranslations(prev => [{ id: uid(), src: text, tr, mode: 'word', provider: provName() }, ...prev].slice(0, 6));
  }

  function addCard(front, back, anno) {
    const id = uid();
    setCards(prev => [{ id, front, back }, ...prev].slice(0, 5));
    if (anno) { anno.carded = true; setAnnotation({ ...anno }); }
    setTrayCollapsed(false);
  }
  function undoCard(id) { setCards(prev => prev.filter(c => c.id !== id)); }

  function clip(s) { return s.length > 64 ? s.slice(0, 62).trim() + '…' : s; }
  function provName() { return (PROVIDERS.find(p => p.id === (config?.provider)) || PROVIDERS[0]).name; }

  // ----- mic / command flow -----
  function toggleMic() {
    if (listening) { setListening(false); setHeard(''); return; }
    setListening(true); setHeard('');
  }
  function runCommand(cmd) {
    setHeard(cmd);
    setTimeout(() => { setListening(false); setHeard(''); }, 520);
    switch (cmd) {
      case 'translate':
      case 'whole sentence':
        translateSentence(active); break;
      case 'this word': {
        const w = lastWordIndex(active); selectWord(active.gi, active.si, w.idx, w.text); break;
      }
      case 'last word': {
        const w = lastWordIndex(active, 1); selectWord(active.gi, active.si, w.idx, w.text); break;
      }
      case '2 words ago': {
        const w = lastWordIndex(active, 2); selectWord(active.gi, active.si, w.idx, w.text); break;
      }
      case 'next word': {
        const w = lastWordIndex(active, 0); selectWord(active.gi, active.si, Math.min(w.idx + 1, w.count - 1), w.nextText); break;
      }
      case 'bookmark': addBookmark(); break;
      case 'notes begin': addNote(); break;
      case 'explain': translateSentence(active); break;
      case 'resume': setPlaying(true); clearAnno(); break;
      default: break;
    }
  }
  function wordsOf(pos) {
    const s = DOC.paragraphs[pos.gi][pos.si];
    return tokenize(s.fr).filter(isWord).map(w => w.replace(/[«».,;:!?“”()]/g, ''));
  }
  function lastWordIndex(pos, back = 0) {
    const ws = wordsOf(pos);
    const idx = Math.max(0, ws.length - 1 - back);
    return { idx, text: ws[idx], count: ws.length, nextText: ws[Math.min(idx + 1, ws.length - 1)] };
  }
  function addBookmark() {
    const s = DOC.paragraphs[active.gi][active.si];
    setBookmarks(prev => [{ id: uid(), text: clip(s.fr), at: sentenceLabel }, ...prev].slice(0, 5));
    setTrayCollapsed(false);
  }
  function addNote() {
    setNotes(prev => [{ id: uid(), text: 'Voice note — "the half-sleep motif recurs here."' }, ...prev].slice(0, 5));
    setTrayCollapsed(false);
  }

  const cfg = config || {};

  return (
    <div className="app" data-hl={t.highlight} data-texture={t.texture}
      style={{ '--doc-size': t.docSize + 'px', '--copper-600': t.accent }}>
      <div className="paper-grain" style={{ position: 'fixed', zIndex: 1 }} />

      {/* Top bar */}
      <header className="topbar">
        <div className="wordmark">
          <span className="mark"><span className="lang">Lang</span><span className="stop">Stop</span></span>
          <span className="sub desktop-only">Reader</span>
        </div>
        <div className="topbar-right">
          <div className="status-pill desktop-only">
            <span className={'dot' + (config ? '' : ' off')} />
            <span className="prov-label">Voice</span>
            <span className="sep" />
            <span className="prov">{provName()}</span>
            <span style={{ color: 'var(--ink-300)' }}>·</span>
            <span className="prov">{cfg.native || 'English'}</span>
          </div>
          <button className="icon-btn" data-tip-down="Import PDF / EPUB"><Icon name="upload" size={18} /></button>
          <button className="icon-btn" onClick={() => setTrayCollapsed(c => !c)} data-tip-down="Study Tray"><Icon name="panelRight" size={18} /></button>
          <button className="icon-btn" onClick={() => setSetupOpen(true)} data-tip-down="Settings"><Icon name="settings" size={18} /></button>
        </div>
      </header>

      {/* Stage */}
      <div className="stage">
        <div className="reader-scroll">
          <Reader
            active={active}
            translating={translating}
            selectedWord={selectedWord}
            annotation={annotation}
            onSelectWord={selectWord}
            onSelectSentence={selectSentence}
            native={cfg.native || 'English'}
            provider={cfg.provider || 'deepseek'}
            model={cfg.model || 'deepseek-chat'}
          />
        </div>

        <StudyTray
          collapsed={trayCollapsed}
          onClose={() => setTrayCollapsed(true)}
          bookmarks={bookmarks} notes={notes} translations={translations}
          cards={cards} due={due} onUndoCard={undoCard}
        />
      </div>

      {/* Command popup */}
      {listening && <CommandPopup playing={playing} onCommand={runCommand} heard={heard} />}

      {/* Playback bar */}
      <PlaybackBar
        playing={playing}
        onPlay={() => { setPlaying(p => !p); if (!playing) clearAnno(); }}
        onPrev={goPrev}
        onNext={goNext}
        speed={speed}
        onSpeed={() => setSpeedIdx(i => (i + 1) % SPEEDS.length)}
        voice={cfg.voice || 'charlotte'}
        listening={listening}
        onMic={toggleMic}
        onTranslate={() => translateSentence(active)}
        sentenceLabel={sentenceLabel}
      />

      {/* Setup sheet */}
      {setupOpen && (
        <SetupSheet
          initial={cfg}
          canClose={!!config}
          onComplete={completeSetup}
          onClose={() => setSetupOpen(false)}
        />
      )}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Reading surface" />
        <TweakSlider label="Text size" value={t.docSize} min={17} max={26} step={1} unit="px"
          onChange={v => setTweak('docSize', v)} />
        <TweakRadio label="Paper texture" value={t.texture} options={['clean', 'subtle', 'rich']}
          onChange={v => setTweak('texture', v)} />
        <TweakSection label="Guided-reading marker" />
        <TweakSelect label="Active sentence" value={t.highlight}
          options={[
            { value: 'wash', label: 'Copper wash' },
            { value: 'sage', label: 'Sage wash' },
            { value: 'edge', label: 'Copper edge' },
            { value: 'underline', label: 'Underline' },
          ]}
          onChange={v => setTweak('highlight', v)} />
        <TweakColor label="Accent" value={t.accent}
          options={['#b06434', '#a8603a', '#9a6a3c', '#6d7a64']}
          onChange={v => setTweak('accent', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
