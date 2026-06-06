/* Reader surface — sentences + word-level selection, inline annotation (mobile) */

function Sentence({ s, gi, si, active, translating, selectedWord, onSelectWord, onSelectSentence }) {
  const tokens = React.useMemo(() => tokenize(s.fr), [s.fr]);
  let wIdx = -1;
  return (
    <span
      className={'sent' + (active ? ' active' : '') + (translating ? ' translating' : '')}
      data-gi={gi} data-si={si}
      onClick={(e) => { if (e.target.classList.contains('sent')) onSelectSentence(gi, si); }}
    >
      {tokens.map((tok, i) => {
        if (!isWord(tok)) return <span key={i}>{tok}</span>;
        wIdx++;
        const myIdx = wIdx;
        const sel = active && selectedWord === myIdx;
        return (
          <span
            key={i}
            className={'word' + (sel ? ' selected' : '')}
            onClick={(e) => { e.stopPropagation(); onSelectWord(gi, si, myIdx, tok.replace(/[«».,;:!?“”()]/g, '')); }}
          >{tok}</span>
        );
      })}
    </span>
  );
}

function Reader({ active, translating, selectedWord, annotation, onSelectWord, onSelectSentence, native, provider, model }) {
  return (
    <div className="page-wrap">
      <article className="page">
        <div className="paper-grain" />
        <header className="doc-head">
          <div className="doc-kicker">{DOC.kicker}</div>
          <h1 className="doc-title">{DOC.title}</h1>
          <div className="doc-byline">{DOC.byline}</div>
          <div className="doc-rule" />
        </header>
        <div className="doc-body">
          {DOC.paragraphs.map((para, gi) => (
            <p className="doc-p" key={gi}>
              {para.map((s, si) => {
                const isActive = active.gi === gi && active.si === si;
                const isTr = translating && translating.gi === gi && translating.si === si;
                const showInline = isTr && annotation;
                return (
                  <React.Fragment key={si}>
                    <Sentence
                      s={s} gi={gi} si={si}
                      active={isActive}
                      translating={isTr}
                      selectedWord={isActive ? selectedWord : null}
                      onSelectWord={onSelectWord}
                      onSelectSentence={onSelectSentence}
                    />
                    {' '}
                    {showInline && (
                      <span className="mobile-only">
                        <InlineAnnotation anno={annotation} native={native} provider={provider} model={model} />
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </p>
          ))}
        </div>
      </article>

      <div className="margin-col desktop-only">
        {annotation ? (
          <MarginAnnotation anno={annotation} native={native} provider={provider} model={model} />
        ) : (
          <div className="margin-empty">
            <b>The margin</b>
            Translations and study notes appear here, aligned to the sentence you’re reading. Say “LangStop, translate” or tap a word.
          </div>
        )}
      </div>
    </div>
  );
}

function AnnoActions({ onCard, carded }) {
  return (
    <span className="anno-actions">
      <button className="anno-chip"><Icon name="explain" size={14} /> Explain</button>
      <button className="anno-chip"><Icon name="spell" size={14} /> Spell</button>
      <button className="anno-chip"><Icon name="examples" size={14} /> Examples</button>
      <button className={'anno-chip' + (carded ? '' : ' copper')} onClick={onCard}>
        <Icon name={carded ? 'check' : 'plus'} size={14} /> {carded ? 'Card added' : 'Make card'}
      </button>
    </span>
  );
}

function MarginAnnotation({ anno, native, provider, model }) {
  const prov = PROVIDERS.find(p => p.id === provider);
  return (
    <aside className="annotation">
      <span className="anno-target">
        <Icon name={anno.mode === 'word' ? 'translate' : 'book'} size={12} stroke={2.2} />
        {anno.mode === 'word' ? 'This word' : 'Whole sentence'}
      </span>
      <div className="anno-src">{anno.src}</div>
      <div className="anno-tr"><span className="lead">{native} · </span>{anno.tr}</div>
      {anno.note && <div className="anno-src" style={{ marginBottom: 12, fontStyle: 'normal', fontSize: 13.5 }}>{anno.note}</div>}
      <div className="anno-meta">
        <span className="badge"><span className="d" /> {prov.name}</span>
        <span>{anno.mode === 'word' ? (anno.pos || 'translated') : model}</span>
      </div>
      <AnnoActions onCard={anno.onCard} carded={anno.carded} />
    </aside>
  );
}

function InlineAnnotation({ anno, native, provider, model }) {
  const prov = PROVIDERS.find(p => p.id === provider);
  return (
    <span className="inline-anno" style={{ display: 'block' }} onClick={e => e.stopPropagation()}>
      <span className="anno-target">
        <Icon name={anno.mode === 'word' ? 'translate' : 'book'} size={12} stroke={2.2} />
        {anno.mode === 'word' ? 'This word' : 'Whole sentence'}
      </span>
      <span className="anno-tr" style={{ display: 'block', marginTop: 9 }}><span className="lead">{native} · </span>{anno.tr}</span>
      <span className="anno-meta" style={{ display: 'flex', marginTop: 9 }}>
        <span className="badge"><span className="d" /> {prov.name}</span>
        <span>{anno.mode === 'word' ? (anno.pos || 'translated') : model}</span>
      </span>
      <span style={{ display: 'block', marginTop: 11 }}><AnnoActions onCard={anno.onCard} carded={anno.carded} /></span>
    </span>
  );
}

Object.assign(window, { Reader, MarginAnnotation, InlineAnnotation });
