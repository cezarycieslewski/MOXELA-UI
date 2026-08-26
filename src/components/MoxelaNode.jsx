import React, { useState, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { ELEMENTS, FORMAT_COLOR } from '../data/elements'
import GearIcon from './GearIcon'

const CAT_COLORS = {
  IN:'#3a6020', OUT:'#2a5010', DEC:'#1a5080', ENC:'#702070',
  MUX:'#503080', RTE:'#107070', SYN:'#503080', OVL:'#704020',
}

function PadBadge({ pad, dim }) {
  const c = FORMAT_COLOR[pad.format] || FORMAT_COLOR.data
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, borderRadius: 3, padding: '2px 6px',
      border: `1px solid ${c.border}`, color: c.color, background: c.bg,
      letterSpacing: '0.04em', whiteSpace: 'nowrap', opacity: dim ? 0.65 : 1,
    }}>{pad.id}</span>
  )
}

export default function MoxelaNode({ data, selected }) {
  const [hovered,     setHovered]     = useState(false)
  const [gearHovered, setGearHovered] = useState(false)

  const def    = ELEMENTS[data.typeKey] || {}
  const stripe = def.stripe || '#78BE20'
  const ins    = def.inputs  || []
  const outs   = def.outputs || []
  const hasConfig = data.config && Object.keys(data.config).length > 0

  const onGearClick = useCallback((e) => {
    e.stopPropagation()
    const event = new CustomEvent('moxela:openconfig', { detail: { nodeId: data.nodeId || data.label }, bubbles: true })
    e.currentTarget.dispatchEvent(event)
  }, [data.nodeId, data.label])

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'row', borderRadius: 7, overflow: 'visible',
        border: `1px solid ${selected ? stripe : hovered ? '#2a4060' : '#1a2e48'}`,
        minWidth: 148,
        boxShadow: selected ? `0 0 0 2px ${stripe}33` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s', position: 'relative',
      }}
    >
      <div style={{ width: 4, background: stripe, flexShrink: 0, borderRadius: '6px 0 0 6px' }} />

      <div style={{ background: '#111e32', flex: 1, borderRadius: '0 6px 6px 0' }}>
        {/* Header */}
        <div style={{ padding: '6px 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a2a40' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#d8e8ff', whiteSpace: 'nowrap', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {def.name || data.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {hasConfig && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#78BE20', opacity: 0.8 }} title="Configured" />}
            <span style={{ fontSize: 8, fontWeight: 700, color: CAT_COLORS[def.cat] || '#3a5070', letterSpacing: '0.08em' }}>{def.cat}</span>
          </div>
        </div>

        {/* Pads row */}
        <div style={{ padding: '4px 8px 4px', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {ins.map(p  => <PadBadge key={p.id} pad={p} dim />)}
          {ins.length > 0 && outs.length > 0 && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4h6M4 1l3 3-3 3" stroke="#1e3a58" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {outs.map(p => <PadBadge key={p.id} pad={p} />)}
        </div>

        {/* Footer: node ID + gear */}
        <div style={{ padding: '2px 8px 5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 8, color: '#1e3050', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {data.nodeId || ''}
          </span>
          <button
            onMouseEnter={() => setGearHovered(true)}
            onMouseLeave={() => setGearHovered(false)}
            onClick={onGearClick}
            title="Configure element"
            style={{
              background: gearHovered ? 'rgba(120,190,32,0.15)' : 'rgba(96,120,152,0.1)',
              border: `1px solid ${gearHovered ? 'rgba(120,190,32,0.4)' : 'rgba(96,120,152,0.25)'}`,
              borderRadius: 4, padding: '3px 5px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.12s, border-color 0.12s',
              flexShrink: 0,
            }}
          >
            <GearIcon size={15} color={gearHovered ? '#a0e040' : '#7090b0'} />
          </button>
        </div>
      </div>

      {/* Input handles */}
      {ins.map((pad, i) => {
        const c = FORMAT_COLOR[pad.format] || FORMAT_COLOR.data
        return (
          <Handle key={pad.id} id={pad.id} type="target" position={Position.Left}
            style={{ top: `${35 + i * 20}%`, background: c.color, width: 9, height: 9, border: '2px solid #0b1219' }}
          />
        )
      })}
      {/* Output handles */}
      {outs.map((pad, i) => {
        const c = FORMAT_COLOR[pad.format] || FORMAT_COLOR.data
        return (
          <Handle key={pad.id} id={pad.id} type="source" position={Position.Right}
            style={{ top: `${35 + i * 20}%`, background: c.color, width: 9, height: 9, border: '2px solid #0b1219' }}
          />
        )
      })}
    </div>
  )
}
