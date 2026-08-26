import GearIcon from './GearIcon'
import React, { useState, useEffect, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'

const stripe = '#d07030'


export default function LogoInserterNode({ data, selected, id }) {
  const [hovered,     setHovered]     = useState(false)
  const [gearHovered, setGearHovered] = useState(false)
  const [applying,    setApplying]    = useState(false)
  const [applyStatus, setApplyStatus] = useState(null)

  // Derive initial values from runtime_config
  const [xPos, setXPos] = useState(() => data.runtime_config?.x_pos ?? 0)
  const [yPos, setYPos] = useState(() => data.runtime_config?.y_pos ?? 0)

  // KEY FIX: sync local slider state when data.runtime_config changes from outside
  // (e.g. loading a pipeline from backend, switching pipelines, or Apply from config panel)
  useEffect(() => {
    setXPos(data.runtime_config?.x_pos ?? 0)
    setYPos(data.runtime_config?.y_pos ?? 0)
  }, [data.runtime_config?.x_pos, data.runtime_config?.y_pos])

  const openConfig = useCallback((e) => {
    e.stopPropagation()
    const event = new CustomEvent('moxela:openconfig', { detail: { nodeId: id }, bubbles: true })
    e.currentTarget.dispatchEvent(event)
  }, [id])

  const applyDirect = useCallback((e) => {
    e.stopPropagation()
    setApplying(true)
    setApplyStatus(null)
    const onResult = (ev) => {
      if (ev.detail?.nodeId !== id) return
      setApplying(false)
      setApplyStatus(ev.detail.ok ? 'ok' : 'err')
      setTimeout(() => setApplyStatus(null), 2500)
      window.removeEventListener('moxela:applyruntime:result', onResult)
    }
    window.addEventListener('moxela:applyruntime:result', onResult)
    window.dispatchEvent(new CustomEvent('moxela:applyruntime', {
      detail: { nodeId: id, runtime_config: { x_pos: xPos, y_pos: yPos } },
    }))
    setTimeout(() => { setApplying(false); window.removeEventListener('moxela:applyruntime:result', onResult) }, 8000)
  }, [id, xPos, yPos])

  const numInput = (val, setter, label, max = 1920) => (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ fontSize:9, color:'#8a7060', fontWeight:700, width:12, flexShrink:0 }}>{label}</span>
      <input
        type="number" value={val} min={0} max={max}
        onChange={e => setter(Number(e.target.value))}
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        style={{
          width:52, background:'#0b1420', border:'1px solid #2a3a50',
          borderRadius:3, padding:'3px 5px', fontSize:10, color:'#c0d8f0',
          outline:'none', fontFamily:'monospace', flexShrink:0,
        }}
      />
      <input
        type="range" min={0} max={max} value={val}
        onChange={e => setter(Number(e.target.value))}
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        style={{ flex:1, accentColor: stripe, cursor:'pointer' }}
      />
    </div>
  )

  const statusColor = applyStatus === 'ok' ? '#78BE20' : applyStatus === 'err' ? '#e04040' : '#78BE20'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'flex', flexDirection:'row', borderRadius:7,
        // overflow must be visible so React Flow doesn't clip the node body
        overflow:'visible',
        border:`1px solid ${selected ? stripe : hovered ? '#3a5060' : '#1a2e48'}`,
        minWidth:220,
        boxShadow: selected ? `0 0 0 2px ${stripe}44` : 'none',
        transition:'border-color 0.15s, box-shadow 0.15s',
        position:'relative',
        // Explicit background on wrapper so node isn't transparent
        background:'#111e32',
        borderRadius:7,
      }}
    >
      {/* Left stripe */}
      <div style={{ width:4, background:stripe, flexShrink:0, borderRadius:'6px 0 0 6px', minHeight:'100%' }} />

      {/* Body */}
      <div style={{ flex:1, borderRadius:'0 6px 6px 0', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'6px 9px 4px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1a2a40', background:'#111e32' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1" y="3" width="10" height="7" rx="1" fill="none" stroke={stripe} strokeWidth="1.2"/>
              <rect x="3" y="1" width="4" height="3" rx="0.5" fill={stripe} opacity="0.8"/>
            </svg>
            <span style={{ fontSize:11, fontWeight:700, color:'#d8e8ff' }}>Logo Inserter</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:8, fontWeight:700, color:'#8a5030', letterSpacing:'0.08em' }}>OVL</span>
            <button
              onMouseEnter={() => setGearHovered(true)}
              onMouseLeave={() => setGearHovered(false)}
              onClick={openConfig}
              onMouseDown={e => e.stopPropagation()}
              style={{
                background: gearHovered ? 'rgba(120,190,32,0.12)' : 'none',
                border:`1px solid ${gearHovered ? 'rgba(120,190,32,0.35)' : 'transparent'}`,
                borderRadius:4, padding:'2px 4px', cursor:'pointer',
                display:'flex', alignItems:'center', transition:'all 0.12s',
              }}
            >
              <GearIcon size={16} color={gearHovered ? '#a0e040' : '#7090b0'} />
            </button>
          </div>
        </div>

        {/* Pads row */}
        <div style={{ padding:'4px 9px', display:'flex', alignItems:'center', gap:5, borderBottom:'1px solid #0e1a28', background:'#111e32' }}>
          <span style={{ fontSize:8, fontWeight:700, borderRadius:3, padding:'2px 6px', border:'1px solid #1a3060', color:'#4a90d0', background:'#0a1422', opacity:0.7 }}>video in</span>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink:0 }}>
            <path d="M1 4h6M4 1l3 3-3 3" stroke="#1e3a58" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize:8, fontWeight:700, borderRadius:3, padding:'2px 6px', border:'1px solid #1a3060', color:'#4a90d0', background:'#0a1422' }}>video out</span>
          <span style={{ fontSize:8, color:'#1e3050', marginLeft:'auto', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:70 }}>{id}</span>
        </div>

        {/* Position label */}
        <div style={{ padding:'7px 9px 3px', background:'#0e1828' }}>
          <div style={{ fontSize:8, fontWeight:700, color:'#7a5030', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>
            Logo position
          </div>
          {/* X slider */}
          <div style={{ marginBottom:5 }}>
            {numInput(xPos, setXPos, 'X', 1920)}
          </div>
          {/* Y slider */}
          <div>
            {numInput(yPos, setYPos, 'Y', 1080)}
          </div>
        </div>

        {/* Apply row */}
        <div style={{ padding:'5px 9px 7px', display:'flex', gap:7, alignItems:'center', background:'#0e1828' }}>
          <button
            onClick={applyDirect}
            onPointerDown={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            disabled={applying}
            style={{
              flex:1,
              background: applyStatus === 'ok'  ? 'rgba(120,190,32,0.15)'
                         : applyStatus === 'err' ? 'rgba(200,40,40,0.15)'
                         : applying              ? 'rgba(120,190,32,0.08)'
                                                 : 'rgba(120,190,32,0.12)',
              border:`1px solid ${applyStatus === 'err' ? '#5a2020' : stripe + '60'}`,
              borderRadius:4, padding:'5px 0', fontSize:10, fontWeight:700,
              color: applyStatus === 'err' ? '#e04040' : '#78BE20',
              cursor: applying ? 'wait' : 'pointer',
              transition:'all 0.15s',
            }}
          >
            {applying ? '…' : applyStatus === 'ok' ? '✓ Applied' : applyStatus === 'err' ? '✗ Failed' : 'Apply'}
          </button>
          <span style={{ fontSize:9, color:'#3a5060', fontFamily:'monospace', flexShrink:0 }}>
            {xPos}, {yPos}
          </span>
        </div>
      </div>

      {/* Handles */}
      <Handle id="in"  type="target" position={Position.Left}
        style={{ top:'30%', background:'#4a90d0', width:10, height:10, border:'2px solid #0b1219' }} />
      <Handle id="out" type="source" position={Position.Right}
        style={{ top:'30%', background:'#4a90d0', width:10, height:10, border:'2px solid #0b1219' }} />
    </div>
  )
}
