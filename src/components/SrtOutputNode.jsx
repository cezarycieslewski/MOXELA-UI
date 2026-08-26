import React, { useState, useCallback, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import GearIcon from './GearIcon'

const stripe = '#4ea010'

const DEFAULT_DEST = () => ({
  addr: '0.0.0.0', port: 9001, mode: 'caller',
  latency: null, passphrase: null, stream_id: null, max_clients: 10,
})

function DestinationDialog({ destKey, dest, onSave, onClose }) {
  const [v, setV] = useState({ ...DEFAULT_DEST(), ...dest })
  const inp = {
    width:'100%', background:'#0b1420', border:'1px solid #1e3050', borderRadius:4,
    padding:'5px 8px', fontSize:12, color:'#c0d8f0', outline:'none', fontFamily:'inherit',
  }
  const field = (label, key, type = 'text', extra = {}) => (
    <div style={{ marginBottom:11 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#607090', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4 }}>{label}</label>
      {type === 'select' ? (
        <select value={v[key]??''} onChange={e => setV(p=>({...p,[key]:e.target.value}))} style={{...inp,cursor:'pointer'}}>
          {extra.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={v[key]??''} min={extra.min} max={extra.max}
          placeholder={extra.nullable ? '(none)' : ''}
          onChange={e => setV(p=>({...p,[key]: type==='number' ? (e.target.value===''?null:Number(e.target.value)) : (e.target.value===''&&extra.nullable?null:e.target.value)}))}
          style={inp} />
      )}
    </div>
  )
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(5,10,18,0.82)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'all' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:340, background:'#0e1826', border:'1px solid #1e3050', borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', background:'#0a1220', borderBottom:'1px solid #1a2a3e', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#d8eeff' }}>SRT Destination</div>
            <div style={{ fontSize:9, color:'#2a5070', fontFamily:'monospace', marginTop:1 }}>{destKey}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#2a4060', cursor:'pointer', fontSize:20 }}>×</button>
        </div>
        <div style={{ padding:'14px 16px', maxHeight:'60vh', overflowY:'auto' }}>
          {field('Destination Address', 'addr')}
          {field('Port', 'port', 'number', { min:0, max:65535 })}
          {field('Mode', 'mode', 'select', { options:['caller','listener'] })}
          {field('Latency (ms)', 'latency', 'number', { min:0, nullable:true })}
          {field('Passphrase', 'passphrase', 'text', { nullable:true })}
          {field('Stream ID', 'stream_id', 'text', { nullable:true })}
          {v.mode === 'listener' && field('Max Clients', 'max_clients', 'number', { min:0 })}
        </div>
        <div style={{ padding:'10px 16px', borderTop:'1px solid #1a2a3e', background:'#0a1220', display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, background:'#0b1420', border:'1px solid #1a2e44', borderRadius:5, padding:'7px 0', fontSize:11, color:'#3a5878', cursor:'pointer' }}>Cancel</button>
          <button onClick={() => { onSave(destKey, v); onClose() }} style={{ flex:2, background:'#78BE20', border:'none', borderRadius:5, padding:'7px 0', fontSize:11, fontWeight:700, color:'#0a1208', cursor:'pointer' }}>Apply</button>
        </div>
      </div>
    </div>
  )
}

export default function SrtOutputNode({ data, selected, id }) {
  const [hovered,     setHovered]     = useState(false)
  const [gearHovered, setGearHovered] = useState(false)
  const [editingDest, setEditingDest] = useState(null)

  const [destinations, setDestinations] = useState(() => {
    const d = data.config?.destinations
    if (d && typeof d === 'object' && Object.keys(d).length > 0) return d
    return { 'out_1': DEFAULT_DEST() }
  })

  useEffect(() => {
    const d = data.config?.destinations
    if (d && typeof d === 'object' && Object.keys(d).length > 0) setDestinations(d)
  }, [data.config?.destinations])

  const destKeys = Object.keys(destinations)
  const numDests = destKeys.length

  const dispatchUpdate = useCallback((newDests) => {
    window.dispatchEvent(new CustomEvent('moxela:nodeupdate', { detail: { nodeId: id, config: { destinations: newDests } } }))
  }, [id])

  const addDest = useCallback((e) => {
    e.stopPropagation()
    const existing = destKeys.map(k => parseInt(k.replace('out_',''))||0)
    const next = Math.max(0, ...existing) + 1
    const key = `out_${next}`
    const newDests = { ...destinations, [key]: DEFAULT_DEST() }
    setDestinations(newDests)
    dispatchUpdate(newDests)
  }, [destinations, destKeys, dispatchUpdate])

  const removeDest = useCallback((key, e) => {
    e.stopPropagation()
    if (numDests <= 1) return
    const newDests = { ...destinations }
    delete newDests[key]
    setDestinations(newDests)
    dispatchUpdate(newDests)
  }, [numDests, destinations, dispatchUpdate])

  const saveDest = useCallback((key, cfg) => {
    const newDests = { ...destinations, [key]: cfg }
    setDestinations(newDests)
    dispatchUpdate(newDests)
  }, [destinations, dispatchUpdate])

  const openGear = useCallback((e) => {
    e.stopPropagation()
    const event = new CustomEvent('moxela:openconfig', { detail: { nodeId: id }, bubbles: true })
    e.currentTarget.dispatchEvent(event)
  }, [id])

  // Calculate handle vertical positions evenly
  const getHandleTop = (idx, total) => {
    if (total === 1) return '50%'
    // spread from 25% to 75%
    const step = 50 / (total - 1)
    return `${25 + idx * step}%`
  }

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display:'flex', flexDirection:'row', borderRadius:7,
          border:`1px solid ${selected ? stripe : hovered ? '#3a5060' : '#1a2e48'}`,
          minWidth:210,
          boxShadow: selected ? `0 0 0 2px ${stripe}44` : 'none',
          transition:'border-color 0.15s',
          position:'relative', background:'#111e32',
        }}
      >
        <div style={{ width:4, background:stripe, flexShrink:0, borderRadius:'6px 0 0 6px' }} />

        <div style={{ flex:1, borderRadius:'0 6px 6px 0', overflow:'hidden' }}>

          {/* Header */}
          <div style={{ padding:'6px 9px 4px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #1a2a40' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#d8e8ff' }}>SRT Output</span>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:8, fontWeight:700, color:'#2a6018', letterSpacing:'0.08em' }}>OUT</span>
              {/* Add destination button */}
              <button onMouseDown={e=>e.stopPropagation()} onClick={addDest}
                title="Add destination"
                style={{ background:'rgba(120,190,32,0.12)', border:'1px solid rgba(120,190,32,0.35)', borderRadius:3, padding:'1px 6px', fontSize:12, color:'#78BE20', cursor:'pointer', lineHeight:1.3, fontWeight:700 }}>+</button>
              {/* Gear */}
              <button
                onMouseEnter={() => setGearHovered(true)}
                onMouseLeave={() => setGearHovered(false)}
                onMouseDown={e=>e.stopPropagation()}
                onClick={openGear}
                title="Configure element"
                style={{
                  background: gearHovered ? 'rgba(120,190,32,0.15)' : 'rgba(96,120,152,0.1)',
                  border: `1px solid ${gearHovered ? 'rgba(120,190,32,0.4)' : 'rgba(96,120,152,0.25)'}`,
                  borderRadius:4, padding:'3px 4px', cursor:'pointer',
                  display:'flex', alignItems:'center',
                  transition:'background 0.12s, border-color 0.12s',
                }}
              >
                <GearIcon size={14} color={gearHovered ? '#a0e040' : '#7090b0'} />
              </button>
            </div>
          </div>

          {/* TS input pad */}
          <div style={{ padding:'4px 9px', display:'flex', alignItems:'center', gap:5, borderBottom:'1px solid #0e1a28' }}>
            <span style={{ fontSize:8, fontWeight:700, borderRadius:3, padding:'2px 6px', border:'1px solid #1e4018', color:'#78BE20', background:'#0a1810', opacity:0.7 }}>TS in</span>
            <span style={{ fontSize:8, color:'#1e3050', marginLeft:'auto', fontFamily:'monospace', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{id}</span>
          </div>

          {/* Destinations — each gets a row + output pad on the right */}
          {destKeys.map((key, idx) => {
            const dest = destinations[key]
            return (
              <div key={key} style={{
                padding:'4px 9px',
                borderBottom: idx < destKeys.length-1 ? '1px solid #0d1828' : 'none',
                display:'flex', alignItems:'center', gap:5,
                position:'relative',
              }}>
                <span style={{ fontSize:9, color:stripe, fontWeight:700, fontFamily:'monospace', flexShrink:0, minWidth:36 }}>{key}</span>
                <span style={{ fontSize:9, color:'#2a4060', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {dest.addr}:{dest.port}
                </span>
                <span style={{ fontSize:8, color:'#1e3a50', flexShrink:0 }}>[{dest.mode}]</span>
                {/* Edit dest */}
                <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setEditingDest(key)}}
                  title={`Configure ${key}`}
                  style={{ background:'rgba(96,120,152,0.1)', border:'1px solid rgba(96,120,152,0.2)', borderRadius:3, padding:'2px 3px', cursor:'pointer', display:'flex', alignItems:'center', flexShrink:0 }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(120,190,32,0.15)'; e.currentTarget.style.borderColor='rgba(120,190,32,0.4)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(96,120,152,0.1)'; e.currentTarget.style.borderColor='rgba(96,120,152,0.2)'}}>
                  <GearIcon size={12} color="#7090b0" />
                </button>
                {/* Remove dest */}
                {numDests > 1 && (
                  <button onMouseDown={e=>e.stopPropagation()} onClick={e=>removeDest(key,e)}
                    title="Remove destination"
                    style={{ background:'none', border:'none', color:'#3a1818', cursor:'pointer', fontSize:14, padding:'0 2px', flexShrink:0, lineHeight:1 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#e04040'}
                    onMouseLeave={e=>e.currentTarget.style.color='#3a1818'}>×</button>
                )}
              </div>
            )
          })}
        </div>

        {/* Single TS input handle (left) */}
        <Handle id="in" type="target" position={Position.Left}
          style={{ top:'20%', background:stripe, width:10, height:10, border:'2px solid #0b1219' }} />

        {/* One output handle per destination (right) — TS format, lime green */}
        {destKeys.map((key, idx) => (
          <Handle
            key={key}
            id={key}
            type="source"
            position={Position.Right}
            style={{
              top: getHandleTop(idx, numDests),
              background: stripe,
              width: 10, height: 10,
              border: '2px solid #0b1219',
            }}
          />
        ))}
      </div>

      {editingDest && (
        <DestinationDialog
          destKey={editingDest}
          dest={destinations[editingDest]}
          onSave={saveDest}
          onClose={() => setEditingDest(null)}
        />
      )}
    </>
  )
}
