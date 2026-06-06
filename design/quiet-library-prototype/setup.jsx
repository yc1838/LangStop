/* First-run setup sheet */

function SetupSheet({ initial, onComplete, onClose, canClose }) {
  const [eleven, setEleven] = React.useState(initial.eleven || '');
  const [llmKey, setLlmKey] = React.useState(initial.llmKey || '');
  const [provider, setProvider] = React.useState(initial.provider || 'deepseek');
  const [model, setModel] = React.useState(initial.model || 'deepseek-chat');
  const [native, setNative] = React.useState(initial.native || 'English');
  const [voice, setVoice] = React.useState(initial.voice || 'charlotte');
  const [remember, setRemember] = React.useState(initial.remember ?? false);
  const [showEleven, setShowEleven] = React.useState(false);
  const [showLlm, setShowLlm] = React.useState(false);

  const prov = PROVIDERS.find(p => p.id === provider);

  function pickProvider(p) {
    setProvider(p.id);
    setModel(p.model);
  }

  function submit() {
    onComplete({ eleven, llmKey, provider, model, native, voice, remember });
  }

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && canClose) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-head">
          <div className="sheet-kicker">Bring your own keys</div>
          <h2 className="sheet-title">Set up your reading desk</h2>
          <p className="sheet-sub">LangStop reads with your own voice and language models. Keys stay on this device — session-only unless you choose to remember them.</p>
          {canClose && (
            <button className="icon-btn ghost sheet-close" onClick={onClose} data-tip="Close"><Icon name="close" size={18} /></button>
          )}
        </div>

        <div className="sheet-body">
          <div className="field">
            <label>ElevenLabs API key</label>
            <div className="input-key">
              <input className="input key" type={showEleven ? 'text' : 'password'} value={eleven}
                onChange={e => setEleven(e.target.value)} placeholder="sk_•••• narration voice" autoComplete="off" />
              <button className="icon-btn ghost reveal" onClick={() => setShowEleven(v => !v)} tabIndex={-1} data-tip={showEleven ? 'Hide' : 'Show'}>
                <Icon name={showEleven ? 'eyeOff' : 'eye'} size={16} />
              </button>
            </div>
            <div className="hint">Powers the read-aloud narration.</div>
          </div>

          <div className="field">
            <label>LLM provider</label>
            <div className="prov-grid">
              {PROVIDERS.map(p => (
                <button key={p.id} className={'prov' + (provider === p.id ? ' sel' : '')} onClick={() => pickProvider(p)}>
                  <span className="pname">{p.name}</span>
                  <span className="pmodel">{p.id === 'custom' ? 'OpenAI-compatible' : p.model}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="row-2">
            <div className="field">
              <label>LLM API key</label>
              <div className="input-key">
                <input className="input key" type={showLlm ? 'text' : 'password'} value={llmKey}
                  onChange={e => setLlmKey(e.target.value)} placeholder={'•••• ' + prov.name + ' key'} autoComplete="off" />
                <button className="icon-btn ghost reveal" onClick={() => setShowLlm(v => !v)} tabIndex={-1} data-tip={showLlm ? 'Hide' : 'Show'}>
                  <Icon name={showLlm ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
            </div>
            <div className="field">
              <label>Model</label>
              <input className="input" value={model} onChange={e => setModel(e.target.value)}
                placeholder="model name" />
              {provider === 'custom' && <div className="hint">Set a base URL in advanced settings.</div>}
            </div>
          </div>

          <div className="field">
            <label>Native language <span className="opt">— translations land here</span></label>
            <select className="input" value={native} onChange={e => setNative(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Narration voice</label>
            <div className="voice-grid">
              {VOICES.map(v => (
                <button key={v.id} className={'voice' + (voice === v.id ? ' sel' : '')} onClick={() => setVoice(v.id)}>
                  <span className="vav">{v.initial}</span>
                  <span className="vt">
                    <span className="vn">{v.name}</span>
                    <span className="vd">{v.desc}</span>
                  </span>
                  <span className="vplay" data-tip="Preview"><Icon name="volume" size={17} /></span>
                </button>
              ))}
            </div>
          </div>

          <div className="toggle-row">
            <div className="tl">
              <div className="t1">Remember keys on this device</div>
              <div className="t2">{remember ? 'Stored locally until you clear them.' : 'Session-only — cleared when you close the tab.'}</div>
            </div>
            <button className={'switch' + (remember ? ' on' : '')} onClick={() => setRemember(v => !v)} role="switch" aria-checked={remember}>
              <span className="knob" />
            </button>
          </div>
        </div>

        <div className="sheet-foot">
          <span className="note"><Icon name="check" size={14} stroke={2.4} /> Keys never leave your browser</span>
          <button className="btn-primary" onClick={submit}>Open the reader</button>
        </div>
      </div>
    </div>
  );
}

window.SetupSheet = SetupSheet;
