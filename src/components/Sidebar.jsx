import React, { useState } from 'react'
import { ELEMENTS, GROUP_ORDER, LEGEND } from '../data/elements'
import { ASSET_BASE } from '../config'

function MoxelaWordmark({ height = 24 }) {
  return (
    <svg height={height} viewBox="396 332 125 32" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(397,332.052)">
        <path d="M13.1896 12.4977 21.9924 21.2076 22.0388 21.2076 30.8416 12.4977 30.8416 30.7536 27.5435 30.7536 27.5667 20.1391 27.4737 20.1391 22.0156 25.667 16.5574 20.1391 16.4644 20.1391 16.4877 30.7536 13.1896 30.7536Z" fill="white"/>
        <path d="M42.1055 31.1484C36.9259 31.1484 32.7685 27.1999 32.7685 22.0437 32.7685 16.8874 36.9259 12.9389 42.1055 12.9389 47.2617 12.9389 51.4425 16.8874 51.4425 22.0437 51.4425 27.1999 47.2617 31.1484 42.1055 31.1484ZM42.1055 16.028C38.8306 16.028 36.206 18.7687 36.206 22.0437 36.206 25.3419 38.8306 28.0592 42.1055 28.0592 45.4036 28.0592 48.005 25.3419 48.005 22.0437 48.005 18.7687 45.4036 16.028 42.1055 16.028Z" fill="white"/>
        <path d="M66.5527 30.7536 62.6043 30.7536 58.9114 24.8773 58.8184 24.8773 55.1021 30.7536 51.1536 30.7536 56.7746 22.0437 51.1536 13.3337 55.1021 13.3337 58.8184 19.2332 58.9114 19.2332 62.6043 13.3337 66.5527 13.3337 60.932 22.0437Z" fill="white"/>
        <path d="M80.4902 27.5947 80.4902 30.7536 67.6924 30.7536 67.6924 13.3337 80.4902 13.3337 80.4902 16.4926 70.9908 16.4926 70.9908 20.4411 78.8877 20.4411 78.8877 23.5998 70.9908 23.5998 70.9908 27.5947Z" fill="white"/>
        <path d="M94.4371 30.7536 82.4523 30.7536 82.4523 13.3337 85.7504 13.3337 85.7504 27.5947 94.4371 27.5947Z" fill="white"/>
        <path d="M107.085 28.2916 99.9085 28.2916 98.84 30.7536 95.0541 30.7536 103.508 12.4977 111.94 30.7536 108.154 30.7536 107.085 28.2916ZM101.256 25.2025 105.738 25.2025 103.555 20.1391 103.462 20.1391Z" fill="white"/>
      </g>
    </svg>
  )
}

export default function Sidebar({ onAddNode, pipelines, activePipeline, onSelectPipeline, onNewPipeline, onDeletePipeline }) {
  const [search, setSearch] = useState('')
  const [tab, setTab]       = useState('elements')

  const grouped = GROUP_ORDER.reduce((acc, g) => {
    const items = Object.entries(ELEMENTS).filter(([, d]) =>
      d.group === g && (search === '' || d.name.toLowerCase().includes(search.toLowerCase()))
    )
    if (items.length) acc[g] = items
    return acc
  }, {})

  const onDragStart = (e, typeKey) => {
    e.dataTransfer.setData('application/moxela-node', typeKey)
    e.dataTransfer.effectAllowed = 'move'
  }

  const tabBtn = (id, label) => (
    <button key={id} onClick={() => setTab(id)} style={{
      flex:1, background: tab===id ? 'rgba(120,190,32,0.12)' : 'none',
      border:'none', borderBottom:`2px solid ${tab===id ? '#78BE20' : 'transparent'}`,
      padding:'10px 0', fontSize:12, fontWeight:600,
      color: tab===id ? '#78BE20' : '#3a5070',
      cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase',
    }}>{label}</button>
  )

  return (
    <aside style={{ width:290, background:'#0e1826', borderRight:'1px solid #1a2638', display:'flex', flexDirection:'column', flexShrink:0, userSelect:'none' }}>

      {/* Logo header */}
      <div style={{ padding:'16px 16px 14px', borderBottom:'1px solid #111e2e', background:'#0a1220', display:'flex', alignItems:'center', gap:14 }}>
        <img src={`${ASSET_BASE}moxela-icon.png`} alt="MOXELA" width={64} height={64} style={{ objectFit:'contain', flexShrink:0 }} />
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <MoxelaWordmark height={30} />
          <div style={{ fontSize:11, color:'#3a6888', letterSpacing:'0.08em' }}>Workflow Designer</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #111e2e' }}>
        {tabBtn('elements', 'Elements')}
        {tabBtn('pipelines', 'Pipelines')}
      </div>

      {/* ELEMENTS TAB */}
      {tab === 'elements' && (
        <>
          <div style={{ padding:'10px 12px 6px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#0b1420', border:'1px solid #1e2e44', borderRadius:6, padding:'7px 11px' }}>
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="#2a4060" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="5" cy="5" r="4"/><line x1="8.5" y1="8.5" x2="11" y2="11"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search elements…"
                style={{ background:'none', border:'none', outline:'none', fontSize:13, color:'#8ab0d0', width:'100%' }} />
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'2px 0 8px' }}>
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div style={{ fontSize:10, fontWeight:700, color:'#3a5070', letterSpacing:'0.12em', textTransform:'uppercase', padding:'10px 14px 5px' }}>
                  {group}
                </div>
                {items.map(([key, def]) => (
                  <div key={key} draggable onDragStart={e => onDragStart(e, key)} onClick={() => onAddNode(key)}
                    style={{ display:'flex', alignItems:'stretch', margin:'0 10px 3px', borderRadius:7, overflow:'hidden', cursor:'grab', border:'1px solid transparent', transition:'border-color 0.12s, background 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#1e3050'; e.currentTarget.style.background='#101c30' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.background='transparent' }}
                  >
                    <div style={{ width:5, background:def.stripe, flexShrink:0 }} />
                    <div style={{ flex:1, padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#c8d8f0', lineHeight:1.2 }}>{def.name}</div>
                        <div style={{ fontSize:10, color:'#4a6080', marginTop:2 }}>
                          {def.inputs.map(p=>p.format).join(',') || '—'} → {def.outputs.map(p=>p.format).join(',') || '—'}
                        </div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, color:'#3a5070', marginLeft:10 }}>{def.cat}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {Object.keys(grouped).length === 0 && (
              <div style={{ fontSize:12, color:'#2a4060', padding:'16px 14px' }}>No results</div>
            )}
          </div>
        </>
      )}

      {/* PIPELINES TAB */}
      {tab === 'pipelines' && (
        <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
          <button onClick={onNewPipeline} style={{ width:'100%', background:'#78BE20', border:'none', borderRadius:6, padding:'8px 0', fontSize:12, color:'#0a1208', fontWeight:700, cursor:'pointer', marginBottom:8 }}>
            + New Pipeline
          </button>
          {Object.entries(pipelines).map(([id, p]) => (
            <div key={id} onClick={() => onSelectPipeline(id)}
              style={{ padding:'9px 11px', borderRadius:7, marginBottom:4, cursor:'pointer', border:`1px solid ${activePipeline===id ? '#78BE20' : 'transparent'}`, background: activePipeline===id ? 'rgba(120,190,32,0.08)' : 'transparent' }}
              onMouseEnter={e => { if (activePipeline!==id) e.currentTarget.style.background='#101c30' }}
              onMouseLeave={e => { if (activePipeline!==id) e.currentTarget.style.background='transparent' }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ fontSize:13, fontWeight:600, color: activePipeline===id ? '#78BE20' : '#c8d8f0' }}>{p.name}</div>
                <button
                  onClick={e => { e.stopPropagation(); if (window.confirm(`Delete pipeline "${p.name}"?`)) onDeletePipeline(id) }}
                  title="Delete pipeline"
                  style={{ background:'transparent', border:'1px solid transparent', borderRadius:4, color:'#3a2020', cursor:'pointer', fontSize:14, padding:'1px 5px', flexShrink:0, transition:'all 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(180,30,30,0.2)'; e.currentTarget.style.color='#e04040'; e.currentTarget.style.borderColor='#5a1010' }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#3a2020'; e.currentTarget.style.borderColor='transparent' }}
                >🗑</button>
              </div>
              <div style={{ fontSize:10, color:'#3a5070', marginTop:2 }}>{p.description || 'No description'}</div>
              <div style={{ fontSize:9, color:'#1e3050', marginTop:3 }}>{Object.keys(p.elements||{}).length} elements · {Object.keys(p.connections||{}).length} connections</div>
            </div>
          ))}
          {Object.keys(pipelines).length === 0 && (
            <div style={{ fontSize:12, color:'#1e3050', textAlign:'center', padding:'20px 0' }}>No pipelines yet</div>
          )}
        </div>
      )}

      {/* Legend — Node types + Edge/signal colors */}
      <div style={{ padding:'10px 14px 8px', borderTop:'1px solid #111e2e' }}>

        {/* Node stripe colors */}
        <div style={{ fontSize:9, fontWeight:700, color:'#2a4060', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Node type</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 8px', marginBottom:10 }}>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:5, height:12, borderRadius:1, background:l.color, flexShrink:0 }} />
              <span style={{ fontSize:10, color:'#607090' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Edge / signal colors */}
        <div style={{ fontSize:9, fontWeight:700, color:'#2a4060', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Signal / edge color</div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {[
            { color:'#78BE20', label:'TS / Data',  desc:'MPEG-TS transport stream' },
            { color:'#4a90d0', label:'Video',       desc:'Raw video essence' },
            { color:'#c040a0', label:'Audio',       desc:'Raw audio / PCM / AAC' },
          ].map(e => (
            <div key={e.label} style={{ display:'flex', alignItems:'center', gap:7 }}>
              {/* Dashed line preview */}
              <svg width="28" height="10" style={{ flexShrink:0 }}>
                <line x1="0" y1="5" x2="28" y2="5" stroke={e.color} strokeWidth="2" strokeDasharray="4,2.5"/>
              </svg>
              <div>
                <span style={{ fontSize:10, fontWeight:600, color:e.color }}>{e.label}</span>
                <span style={{ fontSize:9, color:'#3a5070', marginLeft:5 }}>{e.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'8px 12px', borderTop:'1px solid #111e2e', display:'flex', gap:6 }}>
        <button style={{ flex:1, background:'#0b1420', border:'1px solid #1a2e44', borderRadius:5, padding:'6px 0', fontSize:11, color:'#3a5878', cursor:'pointer' }}>Export</button>
        <button style={{ flex:1, background:'#78BE20', border:'none', borderRadius:5, padding:'6px 0', fontSize:11, color:'#0a1208', fontWeight:700, cursor:'pointer' }}>Import</button>
      </div>
    </aside>
  )
}
