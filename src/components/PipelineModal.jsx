import React, { useState } from 'react'

export default function PipelineModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [desc, setDesc] = useState(initial?.description || '')
  const [autoAv, setAutoAv] = useState(initial?.auto_av_sync !== false)

  const inp = { width: '100%', background: '#0b1420', border: '1px solid #1e3050', borderRadius: 5, padding: '8px 10px', fontSize: 12, color: '#c0d8f0', outline: 'none', marginBottom: 12 }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,18,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 360, background: '#0e1826', border: '1px solid #1e3050', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: '#0a1220', borderBottom: '1px solid #1a2a3e', fontSize: 13, fontWeight: 700, color: '#d8eeff', display: 'flex', justifyContent: 'space-between' }}>
          {initial ? 'Edit Pipeline' : 'New Pipeline'}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#2a4060', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: '16px 16px 8px' }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#607090', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Pipeline Name *</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="my_pipeline" />
          <label style={{ fontSize: 10, fontWeight: 700, color: '#607090', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Description *</label>
          <input style={inp} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Pipeline description" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
            <div onClick={() => setAutoAv(v => !v)} style={{ width: 34, height: 18, borderRadius: 9, background: autoAv ? '#78BE20' : '#1a2e44', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: autoAv ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: autoAv ? '#0a1208' : '#3a5878', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: 11, color: autoAv ? '#78BE20' : '#3a5878' }}>Auto A/V Sync</span>
          </label>
        </div>
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#0b1420', border: '1px solid #1a2e44', borderRadius: 5, padding: '7px 0', fontSize: 11, color: '#3a5878', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { if (!name || !desc) return; onSave({ name, description: desc, auto_av_sync: autoAv }); onClose() }}
            disabled={!name || !desc}
            style={{ flex: 2, background: !name || !desc ? '#2a4020' : '#78BE20', border: 'none', borderRadius: 5, padding: '7px 0', fontSize: 11, fontWeight: 700, color: '#0a1208', cursor: !name||!desc ? 'not-allowed' : 'pointer' }}>
            {initial ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
