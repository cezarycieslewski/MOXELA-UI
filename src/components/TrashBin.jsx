import React, { useState, useEffect, useRef } from 'react'

export default function TrashBin({ onDropNode, draggingNodeId }) {
  const binRef = useRef(null)
  const [over, setOver] = useState(false)

  useEffect(() => {
    if (!draggingNodeId) { setOver(false); return }

    const isOver = (x, y) => {
      if (!binRef.current) return false
      const r = binRef.current.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    }

    const onMove = e => setOver(isOver(e.clientX, e.clientY))
    const onUp   = e => {
      if (isOver(e.clientX, e.clientY)) onDropNode(draggingNodeId)
      setOver(false)
    }

    // Use both pointer and mouse events for maximum compatibility with React Flow
    window.addEventListener('pointermove', onMove, { capture: true })
    window.addEventListener('pointerup',   onUp,   { capture: true })
    window.addEventListener('mousemove',   onMove)
    window.addEventListener('mouseup',     onUp)
    return () => {
      window.removeEventListener('pointermove', onMove, { capture: true })
      window.removeEventListener('pointerup',   onUp,   { capture: true })
      window.removeEventListener('mousemove',   onMove)
      window.removeEventListener('mouseup',     onUp)
    }
  }, [draggingNodeId, onDropNode])

  const hot  = over && !!draggingNodeId
  const warm = !over && !!draggingNodeId

  return (
    <div
      ref={binRef}
      title="Drag node here to delete"
      style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        width: hot ? 72 : 56, height: hot ? 72 : 56, borderRadius: 12, zIndex: 20,
        pointerEvents: 'none',   // don't interfere with React Flow
        background: hot ? '#2a0808' : warm ? '#160c0c' : '#0e1826',
        border: `2px ${hot ? 'solid' : 'dashed'} ${hot ? '#e04040' : warm ? '#4a1818' : '#1e3050'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        transition: 'all 0.1s ease',
      }}
    >
      <svg width={hot?28:22} height={hot?28:22} viewBox="0 0 24 24" fill="none"
        stroke={hot?'#e04040':warm?'#6a2020':'#2a4060'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
      <span style={{
        fontSize: 8, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
        color: hot?'#e04040':warm?'#5a2020':'#1e3050', transition: 'color 0.1s',
      }}>
        {hot ? 'RELEASE' : 'DELETE'}
      </span>
    </div>
  )
}
