import React, { useState, useCallback } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from '@xyflow/react'

export default function DeletableEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, style = {}, markerEnd, selected,
}) {
  const [hovered, setHovered] = useState(false)
  const { setEdges } = useReactFlow()

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const deleteEdge = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setEdges(eds => eds.filter(ed => ed.id !== id))
    window.dispatchEvent(new CustomEvent('moxela:edgedeleted', { detail: { edgeId: id } }))
  }, [id, setEdges])

  const isVisible = hovered || selected

  return (
    <>
      {/* Visible edge line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isVisible ? 2.5 : 1.5,
          filter: isVisible ? 'brightness(1.5)' : 'none',
          transition: 'stroke-width 0.12s, filter 0.12s',
        }}
      />

      {/* Wide transparent hit area — rendered on TOP so it catches events first */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={e => e.stopPropagation()}
      />

      {/* Delete ×  button — shown on hover or when selected */}
      <EdgeLabelRenderer>
        {isVisible && (
          <div
            className="nodrag nopan"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
          >
            <button
              onClick={deleteEdge}
              onMouseDown={e => e.stopPropagation()}
              title="Remove connection"
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: '#cc2020',
                border: '2px solid #0b1219',
                color: '#fff', fontSize: 13, fontWeight: 900,
                lineHeight: '14px', textAlign: 'center',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 8px rgba(200,30,30,0.7)',
                transition: 'transform 0.1s, background 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.25)'; e.currentTarget.style.background='#e03030' }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)';    e.currentTarget.style.background='#cc2020' }}
            >×</button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}
