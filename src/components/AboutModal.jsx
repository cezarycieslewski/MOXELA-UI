import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { ASSET_BASE } from '../config'

// Baked in at build time from package.json — see vite.config.js `define`.
const UI_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

function Row({ label, value, mono, title }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'7px 0', borderBottom:'1px solid #111e2e' }}>
      <span style={{ fontSize:10, fontWeight:700, color:'#607090', letterSpacing:'0.06em', textTransform:'uppercase', flexShrink:0 }}>{label}</span>
      <span title={title} style={{ fontSize:12, color:'#c0d8f0', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  )
}

export default function AboutModal({ onClose }) {
  const [info,  setInfo]  = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true); setError('')
    api.about()
      .then(setInfo)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const gitDirty = info?.git_status && info.git_status.toLowerCase() !== 'clean'

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(5,10,18,0.82)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:'min(420px,92vw)', background:'#0e1826', border:'1px solid #1e3050', borderRadius:10, display:'flex', flexDirection:'column', overflow:'hidden' }}
      >
        {/* Header */}
        <div style={{ padding:'18px 20px 14px', background:'linear-gradient(180deg,rgba(120,190,32,0.09) 0%,transparent 100%)', borderBottom:'2px solid #78BE20', display:'flex', alignItems:'center', gap:12 }}>
          <img src={`${ASSET_BASE}moxela-icon.png`} alt="" width={36} height={36} style={{ objectFit:'contain' }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#d8eeff' }}>About MOXELA</div>
            <div style={{ fontSize:10, color:'#3a6050' }}>Workflow Designer</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#2a4060', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding:'14px 20px' }}>
          <Row label="Web UI Version" value={UI_VERSION} mono />

          <div style={{ fontSize:9, fontWeight:700, color:'#2a4060', letterSpacing:'0.1em', textTransform:'uppercase', margin:'14px 0 2px' }}>Backend</div>

          {loading && (
            <div style={{ fontSize:11, color:'#3a5878', padding:'14px 0', textAlign:'center' }}>Loading build info…</div>
          )}

          {!loading && error && (
            <div>
              <div style={{ background:'rgba(200,40,40,0.12)', border:'1px solid rgba(200,40,40,0.35)', borderRadius:5, padding:'8px 10px', fontSize:11, color:'#e08080', margin:'6px 0 10px' }}>
                Could not reach backend: {error}
              </div>
              <button onClick={load} style={{ background:'#0b1420', border:'1px solid #1a2e44', borderRadius:5, padding:'6px 14px', fontSize:11, color:'#3a5878', cursor:'pointer' }}>Retry</button>
            </div>
          )}

          {!loading && !error && info && (
            <div>
              <Row label="Version"          value={info.version} mono />
              <Row label="Built"            value={info.built} />
              <Row label="Git Branch"       value={info.git_branch} mono />
              <Row label="Git SHA"          value={(info.git_sha || '').slice(0, 10)} title={info.git_sha} mono />
              <Row label="Git Status"       value={
                <span style={{ color: gitDirty ? '#e0a040' : '#78BE20', fontWeight:700 }}>{info.git_status}</span>
              } />
              <Row label="Manifest Version" value={info.manifest_version} mono />
            </div>
          )}
        </div>

        <div style={{ padding:'10px 20px 16px', display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ background:'#78BE20', border:'none', borderRadius:5, padding:'7px 18px', fontSize:11, color:'#0a1208', fontWeight:700, cursor:'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  )
}
