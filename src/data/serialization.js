import { ELEMENTS, DEFAULT_CONFIGS, RUNTIME_CONFIG_ELEMENTS, NULLABLE_FIELDS, NON_NULLABLE_STRING_FIELDS, FORMAT_COLOR } from './elements'

/**
 * Serialize canvas state → API PipelineManagerConfig
 *
 * Deletion semantics (confirmed by user):
 *   PATCH sends "element_id": null  → backend removes that element
 *   PATCH sends "conn_id": null     → backend removes that connection
 *
 * We track deleted IDs separately and inject them as null entries in the payload.
 * This lets the backend perform a proper merge-delete rather than a full replacement.
 */
export function canvasToApiPipeline(pipelineMeta, nodes, edges, deletedNodeIds = new Set(), deletedEdgeIds = new Set()) {
  const elements = {}

  // 1. Emit null for every element deleted since last save
  deletedNodeIds.forEach(id => { elements[id] = null })

  // 2. Emit live elements
  nodes.forEach(node => {
    const typeKey    = node.data.typeKey
    const isInverted = RUNTIME_CONFIG_ELEMENTS.has(typeKey)
    const nullable   = NULLABLE_FIELDS[typeKey]          || new Set()
    const nonNullStr = NON_NULLABLE_STRING_FIELDS[typeKey] || new Set()

    // For inverted elements (av_sync, logo_inserter): user values live in runtime_config.
    // For srt_output: config has a 'destinations' object — preserve as-is, don't merge with defaults.
    // For normal elements: user values live in config.
    const userValues = isInverted ? (node.data.runtime_config || {}) : (node.data.config || {})

    // SRT output with multi-destination config: pass through directly
    if (typeKey === 'srt_output' && userValues.destinations && typeof userValues.destinations === 'object') {
      elements[node.id] = {
        type: typeKey,
        config: { destinations: userValues.destinations },
        runtime_config: null,
        user_metadata: JSON.stringify({ typeKey, position: node.position, label: node.data.label }),
      }
      return
    }

    const merged = { ...DEFAULT_CONFIGS[typeKey], ...userValues }

    const clean = {}
    Object.entries(merged).forEach(([k, v]) => {
      if (nonNullStr.has(k)) {
        // Must always be a string, never null
        clean[k] = (v === null || v === undefined) ? '' : String(v)
      } else if (nullable.has(k)) {
        clean[k] = (v === '' || v === undefined) ? null : v
      } else {
        clean[k] = (v === '' || v === undefined) ? null : v
      }
    })

    const apiConfig        = isInverted ? null  : clean
    const apiRuntimeConfig = isInverted ? clean : (node.data.runtime_config ?? null)

    elements[node.id] = {
      type:           typeKey,
      config:         apiConfig,
      runtime_config: apiRuntimeConfig,
      user_metadata:  JSON.stringify({
        typeKey,
        position: node.position,
        label:    node.data.label,
      }),
    }
  })

  const connections = {}

  // 3. Emit null for every connection deleted since last save
  deletedEdgeIds.forEach(id => { connections[id] = null })

  // 4. Emit live connections
  edges.forEach(edge => {
    const connId = `${edge.source}_${edge.sourceHandle}_to_${edge.target}_${edge.targetHandle}`
    // Don't overwrite a null entry if somehow the same connId appears
    if (!(connId in connections) || connections[connId] !== null) {
      connections[connId] = {
        from: { element: edge.source, pad: edge.sourceHandle || 'out' },
        to:   { element: edge.target, pad: edge.targetHandle  || 'in' },
      }
    }
  })

  return {
    name:         pipelineMeta.name,
    description:  pipelineMeta.description || '',
    auto_av_sync: pipelineMeta.auto_av_sync !== false,
    elements,
    connections,
    user_metadata: JSON.stringify({ viewport: pipelineMeta.viewport || null }),
  }
}

/** Deserialize API PipelineConfig → canvas nodes + edges, restoring saved positions */
export function apiPipelineToCanvas(pipelineId, apiPipeline) {
  const nodes = []
  const edges = []

  Object.entries(apiPipeline.elements || {}).forEach(([id, elem]) => {
    // Skip null entries (deleted elements stored by a previous partial save)
    if (elem === null) return

    let meta = {}
    try { meta = JSON.parse(elem.user_metadata || '{}') } catch {}

    const typeKey    = meta.typeKey || elem.type || 'srt_input'
    const def        = ELEMENTS[typeKey] || {}
    const isInverted = RUNTIME_CONFIG_ELEMENTS.has(typeKey)

    const userConfig = isInverted
      ? (elem.runtime_config || DEFAULT_CONFIGS[typeKey] || {})
      : (elem.config         || DEFAULT_CONFIGS[typeKey] || {})

    const position = (meta.position && typeof meta.position.x === 'number')
      ? meta.position
      : { x: 100 + Math.random() * 500, y: 80 + Math.random() * 300 }

    const nodeType = typeKey === 'logo_inserter' ? 'logoInserterNode'
                   : typeKey === 'srt_output'    ? 'srtOutputNode'
                   : 'moxelaNode'

    nodes.push({
      id,
      type: nodeType,
      position,
      data: {
        typeKey,
        label:          meta.label || def.name || id,
        config:         userConfig,
        runtime_config: isInverted ? null : (elem.runtime_config || null),
        nodeId:         id,
      },
    })
  })

  Object.entries(apiPipeline.connections || {}).forEach(([connId, link]) => {
    // Skip null entries
    if (link === null) return
    // Determine edge color from the source element's output pad format
    const srcElem = apiPipeline.elements?.[link.from.element]
    const srcTypeKey = (() => {
      try { return JSON.parse(srcElem?.user_metadata || '{}').typeKey } catch { return null }
    })() || srcElem?.type || 'srt_input'
    const srcDef   = ELEMENTS[srcTypeKey] || {}
    const srcPad   = srcDef.outputs?.find(p => p.id === link.from.pad)
    const edgeColor = FORMAT_COLOR[srcPad?.format]?.color || '#78BE20'

    edges.push({
      id:           connId,
      type:         'default',
      source:       link.from.element,
      sourceHandle: link.from.pad,
      target:       link.to.element,
      targetHandle: link.to.pad,
      animated:     true,
      style:        { stroke: edgeColor, strokeDasharray: '6 3.5' },
    })
  })

  let viewport = null
  try { viewport = JSON.parse(apiPipeline.user_metadata || '{}').viewport } catch {}

  return { nodes, edges, viewport }
}
