import React, { useState } from 'react'
import { ELEMENTS, CONFIG_FIELDS, DEFAULT_CONFIGS, RUNTIME_CONFIG_ELEMENTS } from '../data/elements'

function Field({ f, value, onChange }) {
  const s = {
    width: '100%', background: '#0b1420', border: '1px solid #1e3050', borderRadius: 4,
    padding: '6px 9px', fontSize: 12, color: '#c0d8f0', outline: 'none', fontFamily: 'inherit',
  }
  if (f.type === 'bool') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div onClick={() => onChange(!value)} style={{ width:34, height:18, borderRadius:9, cursor:'pointer', transition:'background 0.2s', flexShrink:0, background: value ? '#78BE20' : '#1a2e44', position:'relative' }}>
          <div style={{ position:'absolute', top:2, left: value ? 18 : 2, width:14, height:14, borderRadius:'50%', background: value ? '#0a1208' : '#3a5878', transition:'left 0.2s' }} />
        </div>
        <span style={{ fontSize:11, color: value ? '#78BE20' : '#3a5878' }}>{value ? 'Enabled' : 'Disabled'}</span>
      </div>
    )
  }
  if (f.type === 'select') {
    return (
      <select value={value ?? ''} onChange={e => onChange(e.target.value)} style={{ ...s, cursor:'pointer' }}>
        {f.nullable && <option value="">— none —</option>}
        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  if (f.type === 'number') {
    return (
      <input type="number" style={s} value={value ?? ''} min={f.min} max={f.max}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
    )
  }
  return (
    <input type="text" style={s} value={value ?? ''}
      placeholder={f.nullable ? '(none)' : ''}
      onChange={e => onChange(e.target.value === '' && f.nullable ? null : e.target.value)}
    />
  )
}

/**
 * Editor for a "flow map" field — e.g. mxl_input's `flows`, which the API models as
 * null | map<flow tag, { flow_id }>. Renders one row per flow (tag + flow_id) with
 * add/remove controls, and reports back either null (no rows) or a plain object shaped
 * exactly like the API expects: { [tag]: { flow_id } }.
 *
 * Rows are kept in local component state, indexed by position — not derived fresh from
 * `value` on every render. That matters for a freshly-added blank row: the API-shaped
 * object can't represent a row with an empty tag as a real key, so if rows were derived
 * straight from `value` each time, a still-untagged row would vanish the instant it was
 * added (nothing to key it by yet), and the "+ Add Flow" button would look like it does
 * nothing. Keeping rows in local state lets a blank row stay on screen while the user
 * types its tag, and only rows with a non-empty tag are included when reporting the
 * value up via onChange.
 */
function FlowMapField({ value, onChange }) {
  const [rows, setRows] = useState(() => {
    const entries = value && typeof value === 'object' ? Object.entries(value) : []
    return entries.map(([tag, cfg]) => ({ tag, flowId: cfg?.flow_id ?? '' }))
  })

  const s = {
    background: '#0b1420', border: '1px solid #1e3050', borderRadius: 4,
    padding: '6px 9px', fontSize: 12, color: '#c0d8f0', outline: 'none', fontFamily: 'inherit',
  }

  const emit = newRows => {
    setRows(newRows)
    const obj = {}
    newRows.forEach(r => { if (r.tag) obj[r.tag] = { flow_id: r.flowId } })
    // No tagged rows yet (none added, or added but not yet named) → null, matching
    // the API's null | map<...> shape rather than sending an empty object.
    onChange(Object.keys(obj).length === 0 ? null : obj)
  }

  const updateTag    = (i, tag)    => { const next = rows.slice(); next[i] = { ...next[i], tag }; emit(next) }
  const updateFlowId = (i, flowId) => { const next = rows.slice(); next[i] = { ...next[i], flowId }; emit(next) }
  const removeRow = i => emit(rows.filter((_, idx) => idx !== i))
  const addRow    = () => emit([...rows, { tag:'', flowId:'' }])

  return (
    <div>
      {rows.length === 0 && (
        <div style={{ fontSize:10, color:'#2a4060', marginBottom:8 }}>No flows configured.</div>
      )}
      {rows.map((r, i) => (
        <div key={i} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6 }}>
          <input style={{ ...s, flex:1, minWidth:0 }} value={r.tag} placeholder="flow tag (e.g. cam1)"
            onChange={e => updateTag(i, e.target.value.replace(/[^a-zA-Z0-9_]/g,'_'))} />
          <input style={{ ...s, flex:1, minWidth:0 }} value={r.flowId} placeholder="MXL flow ID"
            onChange={e => updateFlowId(i, e.target.value)} />
          <button onClick={() => removeRow(i)} title="Remove flow" style={{
            background:'#0b1420', border:'1px solid #3a1010', borderRadius:4, color:'#c04040',
            width:24, height:24, flexShrink:0, cursor:'pointer', fontSize:13, lineHeight:1,
          }}>×</button>
        </div>
      ))}
      <button onClick={addRow} style={{
        background:'none', border:'1px dashed #1e3050', borderRadius:4, color:'#3a6050',
        padding:'5px 10px', fontSize:11, cursor:'pointer', width:'100%',
      }}>+ Add Flow</button>
    </div>
  )
}

export default function ConfigPanel({ node, nodeId, onClose, onSave }) {
  const def      = ELEMENTS[node.data.typeKey] || {}
  const fields   = CONFIG_FIELDS[node.data.typeKey] || []
  const isInverted = RUNTIME_CONFIG_ELEMENTS.has(node.data.typeKey)

  const [tab, setTab] = useState('config')
  const [elemId, setElemId] = useState(nodeId || node.id)

  // BUG FIX: for inverted elements (av_sync, logo_inserter) the user-facing settings
  // live in node.data.runtime_config, NOT node.data.config (which is always null/empty).
  const [values, setValues] = useState(() => {
    const source = isInverted
      ? (node.data.runtime_config || {})   // ← correct source for logo_inserter
      : (node.data.config || {})
    return { ...DEFAULT_CONFIGS[node.data.typeKey], ...source }
  })

  const tabBtn = (id, label, badge) => (
    <button key={id} onClick={() => setTab(id)} style={{
      flex:1, background: tab===id ? 'rgba(120,190,32,0.1)' : 'none',
      border:'none', borderBottom:`2px solid ${tab===id ? '#78BE20' : 'transparent'}`,
      padding:'7px 0', fontSize:10, fontWeight:600,
      color: tab===id ? '#78BE20' : '#2a4060',
      cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase',
    }}>
      {label}
      {badge && <span style={{ marginLeft:4, fontSize:8, background:'#9060d0', color:'#fff', borderRadius:3, padding:'1px 4px' }}>{badge}</span>}
    </button>
  )

  const handleSave = () => {
    if (isInverted) {
      // config must be null; settings go into runtime_config
      onSave(node.id, elemId, null, values)
    } else {
      onSave(node.id, elemId, values, node.data.runtime_config ?? null)
    }
    onClose()
  }

  // Close on Escape key only - NOT on backdrop click (backdrop click fires when interacting with inputs)
  React.useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    // Full blocking overlay — pointer-events:all ensures NO canvas clicks leak through
    // while config is open. Close only via × button, Cancel, Apply, or Escape.
    <div style={{ position:'absolute', inset:0, background:'rgba(5,10,18,0.80)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'all' }}>
      <div style={{ width:400, maxHeight:'84vh', background:'#0e1826', border:'1px solid #1e3050', borderRadius:10, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #1a2a3e', background:'#0a1220', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:4, height:28, borderRadius:2, background: def.stripe || '#78BE20' }} />
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#d8eeff' }}>{def.name}</div>
              <div style={{ fontSize:9, color:'#2a5070', marginTop:1, fontFamily:'monospace' }}>
                {elemId} · {node.data.typeKey}
                {isInverted && <span style={{ marginLeft:6, color:'#9060d0' }}>runtime_config schema</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#2a4060', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid #111e2e' }}>
          {tabBtn('config', isInverted ? 'Runtime Config' : 'Config', isInverted ? 'RT' : null)}
          {tabBtn('identity', 'Identity')}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 16px' }}>
          {tab === 'config' && (
            <>
              {isInverted && (
                <div style={{ background:'rgba(144,96,208,0.1)', border:'1px solid rgba(144,96,208,0.3)', borderRadius:5, padding:'7px 10px', marginBottom:12, fontSize:10, color:'#9060d0' }}>
                  These settings are sent in <code>runtime_config</code> — changes apply without restarting the element.
                </div>
              )}
              {fields.length === 0 && (
                <div style={{ fontSize:11, color:'#2a4060', textAlign:'center', padding:'20px 0' }}>No configurable parameters for this element type.</div>
              )}
              {fields.map(f => (
                <div key={f.key} style={{ marginBottom:13 }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#607090', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:5 }}>
                    {f.label}
                    {f.nullable && <span style={{ color:'#2a4060', fontWeight:400, marginLeft:5 }}>(optional)</span>}
                  </label>
                  {f.type === 'flowmap'
                    ? <FlowMapField value={values[f.key]} onChange={v => setValues(p => ({ ...p, [f.key]: v }))} />
                    : <Field f={f} value={values[f.key]} onChange={v => setValues(p => ({ ...p, [f.key]: v }))} />}
                  {f.hint && <div style={{ fontSize:9, color:'#2a4060', marginTop:3 }}>{f.hint}</div>}
                </div>
              ))}
            </>
          )}

          {tab === 'identity' && (
            <>
              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#607090', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:5 }}>Element ID</label>
                <input style={{ width:'100%', background:'#0b1420', border:'1px solid #1e3050', borderRadius:4, padding:'6px 9px', fontSize:12, color:'#78BE20', outline:'none', fontFamily:'monospace' }}
                  value={elemId} onChange={e => setElemId(e.target.value.replace(/[^a-zA-Z0-9_]/g,'_'))} placeholder="element_id" />
                <div style={{ fontSize:9, color:'#1e3a50', marginTop:3 }}>Pattern: <code style={{ color:'#3a6050' }}>^[a-zA-Z_][a-zA-Z0-9_]*$</code></div>
              </div>
              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#607090', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:5 }}>Type Discriminator</label>
                <div style={{ background:'#0b1420', border:'1px solid #1e3050', borderRadius:4, padding:'6px 9px', fontSize:12, color:'#4a90d0', fontFamily:'monospace' }}>{node.data.typeKey}</div>
                <div style={{ fontSize:9, color:'#1e3a50', marginTop:3 }}>Sent as <code style={{ color:'#3a6050' }}>"type"</code> to identify the element schema.</div>
              </div>
              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#607090', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:5 }}>API Schema</label>
                <div style={{ background:'#0b1420', border:'1px solid #1e3050', borderRadius:4, padding:'6px 9px', fontSize:10, color:'#3a6050' }}>
                  {isInverted
                    ? <><code>config</code>: null · <code style={{ color:'#9060d0' }}>runtime_config</code>: object</>
                    : <><code style={{ color:'#78BE20' }}>config</code>: object · <code>runtime_config</code>: null</>}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ padding:'10px 16px', borderTop:'1px solid #1a2a3e', background:'#0a1220', display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, background:'#0b1420', border:'1px solid #1a2e44', borderRadius:5, padding:'7px 0', fontSize:11, color:'#3a5878', cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex:2, background:'#78BE20', border:'none', borderRadius:5, padding:'7px 0', fontSize:11, color:'#0a1208', fontWeight:700, cursor:'pointer' }}>Apply</button>
        </div>
      </div>
    </div>
  )
}
