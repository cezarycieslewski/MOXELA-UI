import React, { useState, useEffect, useRef } from 'react'

export default function JsonEditorModal({ pipeline, pipelineId, onClose, onApply }) {
  const [text, setText]         = useState('')
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    try {
      setText(JSON.stringify(pipeline, null, 2))
    } catch {
      setText('')
    }
  }, [pipeline])

  const validate = (val) => {
    try { JSON.parse(val); setError(''); return true }
    catch (e) { setError(e.message); return false }
  }

  const onChange = (val) => {
    setText(val)
    try { JSON.parse(val); setError('') }
    catch (e) { setError(e.message) }
  }

  const handleApply = () => {
    if (!validate(text)) return
    try {
      const parsed = JSON.parse(text)
      onApply(pipelineId, parsed)
      onClose()
    } catch (e) { setError(e.message) }
  }

  const handleExport = () => {
    const blob = new Blob([text], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${pipelineId || 'pipeline'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { onChange(ev.target.result) }
    reader.readAsText(file)
    e.target.value = ''
  }

  const btn = (label, onClick, opts = {}) => (
    <button onClick={onClick} style={{
      background: opts.primary ? '#78BE20' : opts.danger ? '#3a0808' : '#0b1420',
      border: `1px solid ${opts.primary ? 'transparent' : opts.danger ? '#5a1010' : '#1a2e44'}`,
      borderRadius: 5, padding: '6px 14px', fontSize: 11,
      color: opts.primary ? '#0a1208' : opts.danger ? '#e04040' : '#3a5878',
      fontWeight: opts.primary ? 700 : 400,
      cursor: 'pointer', ...opts.style,
    }}>{label}</button>
  )

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(5,10,18,0.82)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:'min(860px,92vw)', height:'min(680px,90vh)', background:'#0e1826', border:'1px solid #1e3050', borderRadius:10, display:'flex', flexDirection:'column', overflow:'hidden' }}
      >
        {/* Header */}
        <div style={{ padding:'12px 16px', background:'#0a1220', borderBottom:'1px solid #1a2a3e', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <span style={{ fontSize:13, fontWeight:700, color:'#d8eeff' }}>Pipeline JSON Editor</span>
            <span style={{ marginLeft:10, fontSize:10, color:'#2a5070', fontFamily:'monospace' }}>{pipelineId}</span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#2a4060', cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>
        </div>

        {/* Toolbar */}
        <div style={{ padding:'8px 14px', borderBottom:'1px solid #111e2e', display:'flex', gap:7, alignItems:'center', flexShrink:0, background:'#0b1520' }}>
          {btn(copied ? '✓ Copied' : 'Copy', handleCopy)}
          {btn('Export .json', handleExport)}
          <label style={{ cursor:'pointer' }}>
            <span style={{ background:'#0b1420', border:'1px solid #1a2e44', borderRadius:5, padding:'6px 14px', fontSize:11, color:'#3a5878', display:'inline-block' }}>
              Import file
            </span>
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display:'none' }} />
          </label>
          <div style={{ flex:1 }} />
          {error && (
            <span style={{ fontSize:10, color:'#e05050', fontFamily:'monospace', maxWidth:320, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              ⚠ {error}
            </span>
          )}
          {btn('Apply to canvas', handleApply, { primary:true, style:{ opacity: error ? 0.5 : 1 } })}
        </div>

        {/* Editor */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
            style={{
              width:'100%', height:'100%', background:'#080f1a', border:'none',
              color: error ? '#e0c0c0' : '#c8e0b0',
              fontFamily:"'Fira Code','Cascadia Code','Consolas',monospace",
              fontSize:12, lineHeight:1.6, padding:'14px 16px',
              outline:'none', resize:'none', overflowY:'auto',
              borderLeft: `3px solid ${error ? '#e04040' : '#1e3050'}`,
            }}
          />
        </div>

        {/* Footer */}
        <div style={{ padding:'8px 16px', borderTop:'1px solid #111e2e', background:'#0a1220', display:'flex', gap:8, flexShrink:0 }}>
          {btn('Cancel', onClose)}
          <div style={{ flex:1 }} />
          <span style={{ fontSize:9, color:'#1e3050', alignSelf:'center' }}>
            Editing pipeline config · changes apply to canvas only until you Save to backend
          </span>
          {btn('Apply to canvas', handleApply, { primary:true, style:{ opacity: error ? 0.5 : 1 } })}
        </div>
      </div>
    </div>
  )
}
