/* Playback bar, command popup, study tray */

const SPEEDS = [0.75, 1, 1.25, 1.5];

function PlaybackBar({ playing, onPlay, onPrev, onNext, speed, onSpeed, voice, listening, onMic, onTranslate, sentenceLabel }) {
  const v = VOICES.find((x) => x.id === voice) || VOICES[0];
  return (
    <div className="playbar-wrap">
      <div className={'playbar' + (playing ? ' playing' : '')}>
        <button className="pb-btn" onClick={onPrev} data-tip="Previous sentence"><Icon name="prev" size={20} /></button>
        <button className="pb-play" onClick={onPlay} data-tip={playing ? 'Pause' : 'Play'}>
          <span className="pb-ico" key={playing ? 'pause' : 'play'}><Icon name={playing ? 'pause' : 'play'} size={22} /></span>
        </button>
        <button className="pb-btn" onClick={onNext} data-tip="Next sentence"><Icon name="next" size={20} /></button>

        <span className="pb-sep" />

        <div className="pb-voice">
          <span className="pb-eq" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="vmeta">
            <span className="vname">{v.name}</span>
            <span className="vstate" style={{ textAlign: "right", padding: "0px 0px 0px 10px" }}>{listening ? 'Listening…' : playing ? 'Narrating · ' + sentenceLabel : 'Paused · ' + sentenceLabel}</span>
          </span>
        </div>

        <button className="pb-speed desktop-only" onClick={onSpeed} data-tip="Playback speed">{speed}×</button>

        <span className="pb-sep desktop-only" />

        <button className={'pb-mic' + (listening ? ' listening' : '')} onClick={onMic} data-tip={listening ? 'Listening — say a command' : 'Hold to speak · “LangStop”'}>
          <Icon name="mic" size={19} />
        </button>

        <button className="pb-translate" onClick={onTranslate} data-tip="Translate current sentence">
          <Icon name="translate" size={17} /> <span className="desktop-only">Translate</span>
        </button>
      </div>
    </div>);

}

/* Context-aware command sets */
const CMD_PLAYING = [
{ c: 'translate', likely: true }, { c: 'this word' }, { c: 'last word' },
{ c: '2 words ago' }, { c: 'bookmark' }, { c: 'notes begin' }];

const CMD_PAUSED = [
{ c: 'this word' }, { c: 'last word' }, { c: 'next word' },
{ c: 'whole sentence', likely: true }, { c: 'explain' }, { c: 'resume' }];


function CommandPopup({ playing, onCommand, heard }) {
  const cmds = playing ? CMD_PLAYING : CMD_PAUSED;
  return (
    <div className="command-pop">
      <div className="cmd-head">
        <span className="cmd-wake"><span className="live" /> LangStop</span>
        <span className="cmd-context">{playing ? 'while reading' : 'while paused'}</span>
      </div>
      <div className="cmd-listening">
        {heard ? <span>“<span className="heard">{heard}</span>”</span> : <span>Listening for a command…</span>}
      </div>
      <div className="cmd-chips">
        {cmds.map((cmd, i) =>
        <button key={i} className={'cmd-chip' + (cmd.likely ? ' likely' : '')} onClick={() => onCommand(cmd.c)}>
            {cmd.c}
          </button>
        )}
      </div>
    </div>);

}

/* ---------- Study Tray ---------- */
function StudyTray({ collapsed, onClose, bookmarks, notes, translations, cards, due, onUndoCard }) {
  const total = bookmarks.length + notes.length + translations.length + cards.length;
  return (
    <aside className={'tray' + (collapsed ? ' collapsed' : '')}>
      <div className="tray-inner">
        <div className="tray-grip" />
        <div className="tray-head">
          <span className="ti">Study Tray</span>
          <span className="count">{total}</span>
          <button className="icon-btn ghost" style={{ marginLeft: 'auto' }} onClick={onClose} data-tip="Hide tray"><Icon name="chevron" size={18} /></button>
        </div>
        <div className="tray-body">

          <section className="tray-section">
            <h4><Icon name="cards" size={13} /> New flashcards</h4>
            {cards.length === 0 && <div className="tray-empty">Make a card from any translation.</div>}
            {cards.map((c) =>
            <div className="flashcard" key={c.id}>
                <span className="ribbon" />
                <div className="fhead">
                  <span className="fnew">New card</span>
                  <button className="undo" onClick={() => onUndoCard(c.id)}>Undo</button>
                </div>
                <div className="ffront">{c.front}</div>
                <div className="fback">{c.back}</div>
              </div>
            )}
          </section>

          <section className="tray-section">
            <h4><Icon name="translate" size={13} /> Recent translations</h4>
            {translations.length === 0 && <div className="tray-empty">Nothing captured yet.</div>}
            {translations.map((t) =>
            <div className="tcard" key={t.id}>
                <div className="tquote">{t.src}</div>
                <div className="ttr">{t.tr}</div>
                <div className="tmeta"><span className="tnum">{t.mode === 'word' ? 'WORD' : 'SENTENCE'}</span> · {t.provider}</div>
              </div>
            )}
          </section>

          <section className="tray-section">
            <h4><Icon name="bookmark" size={13} /> Bookmarks</h4>
            {bookmarks.length === 0 && <div className="tray-empty">No bookmarks yet.</div>}
            {bookmarks.map((b) =>
            <div className="tcard" key={b.id}>
                <div className="tquote">{b.text}</div>
                <div className="tmeta"><Icon name="clock" size={11} /> {b.at}</div>
              </div>
            )}
          </section>

          <section className="tray-section">
            <h4><Icon name="note" size={13} /> Notes</h4>
            {notes.length === 0 && <div className="tray-empty">Say “LangStop, notes begin”.</div>}
            {notes.map((n) =>
            <div className="tcard" key={n.id}>
                <div className="tquote" style={{ fontStyle: 'italic' }}>{n.text}</div>
              </div>
            )}
          </section>

          <section className="tray-section">
            <h4><Icon name="clock" size={13} /> Due for review</h4>
            {due.map((d) =>
            <div className="due-row" key={d.id}>
                <span className="dfront">{d.front}</span>
                <span className="dwhen">{d.when}</span>
              </div>
            )}
          </section>

        </div>
      </div>
    </aside>);

}

Object.assign(window, { PlaybackBar, CommandPopup, StudyTray, SPEEDS });