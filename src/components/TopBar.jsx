import React from 'react'
import { ASSET_BASE } from '../config'

export default function TopBar({ pipeline, onSave, onLoad, onJsonEditor, saving, saveStatus, username, onLogout, nodeCount, edgeCount }) {
  return (
    <div style={{
      height:62, background:'linear-gradient(90deg,#070d16 0%,#0b1828 100%)',
      borderBottom:'3px solid #78BE20', display:'flex', alignItems:'center',
      padding:'0 16px', flexShrink:0, gap:0,
    }}>
      {/* Left: pipeline name + actions */}
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', marginRight:14, minWidth:0, maxWidth:200 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#d8eeff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {pipeline?.name || 'No pipeline selected'}
        </div>
        <div style={{ fontSize:9, color:'#2a5070', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {pipeline?.description || ''}
        </div>
      </div>

      <div style={{ width:1, height:28, background:'#1a2e44', marginRight:12 }} />

      <button onClick={onLoad} style={{ background:'none', border:'1px solid #1e3450', borderRadius:5, padding:'5px 12px', fontSize:11, color:'#4a8898', cursor:'pointer', marginRight:6, whiteSpace:'nowrap' }}>
        ↓ Load
      </button>
      <button onClick={onSave} disabled={saving||!pipeline} style={{
        background: saving ? '#3a5a20' : '#78BE20', border:'none', borderRadius:5,
        padding:'5px 14px', fontSize:11, fontWeight:700, color:'#0a1208',
        cursor: saving||!pipeline ? 'not-allowed' : 'pointer', marginRight:6,
        opacity: !pipeline ? 0.5 : 1, whiteSpace:'nowrap',
      }}>{saving ? 'Saving…' : '↑ Save'}</button>

      <button onClick={onJsonEditor} disabled={!pipeline} title="View / edit pipeline JSON"
        style={{ background:'none', border:'1px solid #1e3450', borderRadius:5, padding:'5px 10px', fontSize:11, color:'#4a7090', cursor:!pipeline?'not-allowed':'pointer', opacity:!pipeline?0.4:1, marginRight:10, display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12"/>
        </svg>
        JSON
      </button>

      {saveStatus && (
        <span style={{ fontSize:10, color: saveStatus.ok ? '#78BE20' : '#e05050', whiteSpace:'nowrap', overflow:'hidden', maxWidth:200 }}>
          {saveStatus.msg}
        </span>
      )}

      <div style={{ flex:1 }} />

      {/* Center: Nevion logo — full wordmark, centered */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px' }}>
        <img src={`${ASSET_BASE}nevion-logo-white.png`} alt="Nevion"
          style={{ height:30, width:'auto', minWidth:168, opacity:0.9, display:'block' }} />
      </div>

      <div style={{ flex:1 }} />

      {/* Right: status + logout */}
      <span style={{ fontSize:10, color:'#304860', marginRight:12, whiteSpace:'nowrap' }}>
        {nodeCount} nodes · {edgeCount} edges
      </span>

      {onLogout && (
        <>
          <div style={{ width:1, height:22, background:'#1a2e44', marginRight:12 }} />

          <button onClick={onLogout} style={{
            background:'rgba(120,190,32,0.10)',
            border:'1px solid rgba(120,190,32,0.28)',
            borderRadius:5, padding:'5px 13px',
            fontSize:11, color:'#78BE20',
            cursor:'pointer', display:'flex', alignItems:'center', gap:7,
            whiteSpace:'nowrap',
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 8H3M6 5l-3 3 3 3M11 3h2a1 1 0 011 1v8a1 1 0 01-1 1h-2"/>
            </svg>
            {username}
          </button>
        </>
      )}
    </div>
  )
}
