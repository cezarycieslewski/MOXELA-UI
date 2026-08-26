import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState, BackgroundVariant,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import LoginScreen      from './components/LoginScreen'
import Sidebar           from './components/Sidebar'
import TopBar            from './components/TopBar'
import MoxelaNode        from './components/MoxelaNode'
import LogoInserterNode  from './components/LogoInserterNode'
import SrtOutputNode    from './components/SrtOutputNode'
import DeletableEdge     from './components/DeletableEdge'
import ConfigPanel       from './components/ConfigPanel'
import TrashBin          from './components/TrashBin'
import PipelineModal     from './components/PipelineModal'
import JsonEditorModal   from './components/JsonEditorModal'
import { api }           from './api/client'
import { ELEMENTS, FORMAT_COLOR, RUNTIME_CONFIG_ELEMENTS } from './data/elements'
import { canvasToApiPipeline, apiPipelineToCanvas } from './data/serialization'

const nodeTypes = {
  moxelaNode:       MoxelaNode,
  logoInserterNode: LogoInserterNode,
  srtOutputNode:    SrtOutputNode,
}

const edgeTypes = {
  default: DeletableEdge,
}

let idCounter = 1
const mkId = typeKey => `${typeKey}_${idCounter++}`
const resolveType = typeKey => {
  if (typeKey === 'logo_inserter') return 'logoInserterNode'
  if (typeKey === 'srt_output')    return 'srtOutputNode'
  return 'moxelaNode'
}

function FlowCanvas({ user, onLogout }) {
  const wrapRef = useRef(null)
  const { getViewport, setViewport } = useReactFlow()
  const [rfInstance, setRfInstance] = useState(null)

  const [pipelines,        setPipelines]        = useState({})
  const [activePipelineId, setActivePipelineId] = useState(null)
  const [pipelineMeta,     setPipelineMeta]      = useState(null)
  const viewportCache = useRef({})

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const deletedNodeIds = useRef(new Set())
  const deletedEdgeIds = useRef(new Set())

  const [draggingNodeId, setDraggingNodeId] = useState(null)
  const dragTimerRef = useRef(null)

  const [configNode,   setConfigNode]   = useState(null)
  const [configNodeId, setConfigNodeId] = useState(null)
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [showJsonEditor,    setShowJsonEditor]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [loading,    setLoading]    = useState(false)

  // ── Track edges deleted via DeletableEdge's X button ─────────────────────
  useEffect(() => {
    const handler = e => {
      const { edgeId } = e.detail || {}
      if (edgeId) deletedEdgeIds.current.add(edgeId)
    }
    window.addEventListener('moxela:edgedeleted', handler)
    return () => window.removeEventListener('moxela:edgedeleted', handler)
  }, [])

  // ── Node data update from inline node components ────────────────────────────
  useEffect(() => {
    const handler = e => {
      const { nodeId, config } = e.detail || {}
      if (!nodeId) return
      setNodes(nds => nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } } : n
      ))
    }
    window.addEventListener('moxela:nodeupdate', handler)
    return () => window.removeEventListener('moxela:nodeupdate', handler)
  }, [setNodes])

  // ── Gear-click (open config panel) ───────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      const nodeId = e.detail?.nodeId
      if (!nodeId) return
      setNodes(nds => {
        const found = nds.find(n => n.id === nodeId || n.data?.nodeId === nodeId)
        if (found) { setConfigNode(found); setConfigNodeId(found.id) }
        return nds
      })
    }
    window.addEventListener('moxela:openconfig', handler)
    return () => window.removeEventListener('moxela:openconfig', handler)
  }, [setNodes])

  // ── Inline Apply from LogoInserterNode ───────────────────────────────────
  useEffect(() => {
    const handler = async (e) => {
      const { nodeId, runtime_config } = e.detail || {}
      if (!nodeId) return

      setNodes(nds => nds.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, runtime_config, config: null } } : n
      ))

      try {
        const currentNodes = rfInstance?.getNodes() || []
        const currentEdges = rfInstance?.getEdges() || []
        const patchedNodes = currentNodes.map(n =>
          n.id === nodeId ? { ...n, data: { ...n.data, runtime_config, config: null } } : n
        )
        const vp  = getViewport()
        const meta = { ...pipelineMeta, viewport: vp }
        const apiPipeline = canvasToApiPipeline(meta, patchedNodes, currentEdges, deletedNodeIds.current, deletedEdgeIds.current)
        const updated = { ...pipelines, [activePipelineId]: apiPipeline }
        const result  = await api.savePipelines({ pipelines: updated })
        if (result.ok === false) throw new Error(result.msg || result.err)
        setPipelines(updated)
        setSaveStatus({ ok: true, msg: `Logo position applied (${runtime_config.x_pos}, ${runtime_config.y_pos})` })
        window.dispatchEvent(new CustomEvent('moxela:applyruntime:result', { detail: { nodeId, ok: true } }))
      } catch (err) {
        setSaveStatus({ ok: false, msg: `Apply failed: ${err.message}` })
        window.dispatchEvent(new CustomEvent('moxela:applyruntime:result', { detail: { nodeId, ok: false } }))
      }
      setTimeout(() => setSaveStatus(null), 4000)
    }
    window.addEventListener('moxela:applyruntime', handler)
    return () => window.removeEventListener('moxela:applyruntime', handler)
  }, [pipelines, activePipelineId, pipelineMeta, rfInstance, getViewport, setNodes])

  const onNodeDoubleClick = useCallback((_e, node) => {
    setConfigNode(node); setConfigNodeId(node.id)
  }, [])

  // ── Load / select ─────────────────────────────────────────────────────────
  useEffect(() => { loadFromBackend() }, [])

  const loadFromBackend = async () => {
    setLoading(true)
    try {
      const data = await api.getPipelines()
      const pls  = data.pipelines || {}
      setPipelines(pls)
      const ids = Object.keys(pls)
      setSaveStatus({ ok: true, msg: `Loaded ${ids.length} pipeline(s)` })
      setTimeout(() => setSaveStatus(null), 3000)
      if (ids.length > 0) selectPipeline(ids[0], pls)
    } catch (err) {
      setSaveStatus({ ok: false, msg: `Load failed: ${err.message}` })
    } finally { setLoading(false) }
  }

  const selectPipeline = (id, pls = pipelines) => {
    const pipeline = pls[id]
    if (!pipeline) return
    if (activePipelineId && rfInstance) viewportCache.current[activePipelineId] = getViewport()
    setActivePipelineId(id)
    setPipelineMeta({ name: pipeline.name, description: pipeline.description, auto_av_sync: pipeline.auto_av_sync })
    deletedNodeIds.current = new Set()
    deletedEdgeIds.current = new Set()
    const { nodes: n, edges: e, viewport } = apiPipelineToCanvas(id, pipeline)
    // Stamp all edges with our custom type
    setNodes(n)
    setEdges(e.map(edge => ({ ...edge, type: 'default' })))
    const vp = viewport || viewportCache.current[id]
    if (vp) setTimeout(() => setViewport(vp), 50)
    else if (rfInstance) setTimeout(() => rfInstance.fitView({ padding: 0.15 }), 50)
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const saveToBackend = async () => {
    if (!activePipelineId || !pipelineMeta) return
    setSaving(true); setSaveStatus(null)
    try {
      const vp  = getViewport()
      const meta = { ...pipelineMeta, viewport: vp }
      const apiPipeline = canvasToApiPipeline(meta, nodes, edges, deletedNodeIds.current, deletedEdgeIds.current)
      const updated = { ...pipelines, [activePipelineId]: apiPipeline }
      const result  = await api.savePipelines({ pipelines: updated })
      if (result.ok === false) throw new Error(result.msg || result.err || 'Unknown error')
      deletedNodeIds.current = new Set()
      deletedEdgeIds.current = new Set()
      setPipelines(updated)
      setSaveStatus({ ok: true, msg: 'Saved' })
    } catch (err) {
      setSaveStatus({ ok: false, msg: `Save failed: ${err.message}` })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 5000)
    }
  }

  // ── JSON editor: apply parsed JSON back to canvas ─────────────────────────
  const handleJsonApply = useCallback((pipelineId, parsed) => {
    const { nodes: n, edges: e } = apiPipelineToCanvas(pipelineId, parsed)
    setNodes(n)
    setEdges(e.map(edge => ({ ...edge, type: 'default' })))
    setPipelineMeta({ name: parsed.name, description: parsed.description, auto_av_sync: parsed.auto_av_sync })
    deletedNodeIds.current = new Set()
    deletedEdgeIds.current = new Set()
    setSaveStatus({ ok: true, msg: 'JSON applied to canvas — remember to Save to backend' })
    setTimeout(() => setSaveStatus(null), 5000)
  }, [setNodes, setEdges])

  // ── Pipeline CRUD ─────────────────────────────────────────────────────────
  const createPipeline = meta => {
    const id = meta.name.toLowerCase().replace(/[^a-z0-9]/g,'_')
    const pl = { name:meta.name, description:meta.description, auto_av_sync:meta.auto_av_sync, elements:{}, connections:{} }
    setPipelines(p => ({...p,[id]:pl}))
    setActivePipelineId(id); setPipelineMeta(meta)
    deletedNodeIds.current = new Set(); deletedEdgeIds.current = new Set()
    setNodes([]); setEdges([])
  }

  const deletePipeline = async id => {
    // Send null for the pipeline id — PATCH merge-delete semantics
    try {
      const result = await api.savePipelines({ pipelines: { [id]: null } })
      if (result.ok === false) throw new Error(result.msg || result.err)
      const updated = {...pipelines}; delete updated[id]
      setPipelines(updated)
      if (activePipelineId===id) { setActivePipelineId(null); setPipelineMeta(null); setNodes([]); setEdges([]) }
      setSaveStatus({ ok:true, msg:`Pipeline deleted` })
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      setSaveStatus({ ok:false, msg:`Delete failed: ${err.message}` })
    }
  }

  // ── Connections ───────────────────────────────────────────────────────────
  const onConnect = useCallback(params => {
    const srcNode = nodes.find(n => n.id === params.source)
    const def     = ELEMENTS[srcNode?.data?.typeKey]
    const pad     = def?.outputs?.find(p => p.id === params.sourceHandle)
    const c       = FORMAT_COLOR[pad?.format] || FORMAT_COLOR.data
    setEdges(eds => addEdge({
      ...params,
      type: 'default',
      animated: true,
      style: { stroke: c.color, strokeDasharray: '6 3.5' },
    }, eds))
  }, [nodes, setEdges])

  // ── Nodes / edges changes ─────────────────────────────────────────────────
  const handleNodesChange = useCallback(changes => {
    changes.forEach(change => {
      if (change.type === 'remove') {
        deletedNodeIds.current.add(change.id)
        setEdges(eds => {
          eds.filter(e => e.source===change.id||e.target===change.id).forEach(e => deletedEdgeIds.current.add(e.id))
          return eds.filter(e => e.source!==change.id&&e.target!==change.id)
        })
      }
    })
    onNodesChange(changes)
  }, [onNodesChange, setEdges])

  const handleEdgesChange = useCallback(changes => {
    changes.forEach(change => { if (change.type==='remove') deletedEdgeIds.current.add(change.id) })
    onEdgesChange(changes)
  }, [onEdgesChange])

  // ── Drag to trash ─────────────────────────────────────────────────────────
  const onNodeDragStart = useCallback((_e, node) => {
    if (dragTimerRef.current) clearTimeout(dragTimerRef.current)
    setDraggingNodeId(node.id)
  }, [])
  const onNodeDragStop = useCallback(() => {
    dragTimerRef.current = setTimeout(() => setDraggingNodeId(null), 150)
  }, [])
  const deleteNodeById = useCallback(nodeId => {
    if (dragTimerRef.current) clearTimeout(dragTimerRef.current)
    setDraggingNodeId(null)
    deletedNodeIds.current.add(nodeId)
    setEdges(eds => {
      eds.filter(e => e.source===nodeId||e.target===nodeId).forEach(e => deletedEdgeIds.current.add(e.id))
      return eds.filter(e => e.source!==nodeId&&e.target!==nodeId)
    })
    setNodes(nds => nds.filter(n => n.id!==nodeId))
  }, [setNodes, setEdges])

  // ── Drop from sidebar ─────────────────────────────────────────────────────
  const onDragOver = useCallback(e => { e.preventDefault(); e.dataTransfer.dropEffect='move' }, [])
  const onDrop     = useCallback(e => {
    e.preventDefault()
    const typeKey = e.dataTransfer.getData('application/moxela-node')
    if (!typeKey||!rfInstance) return
    const bounds   = wrapRef.current.getBoundingClientRect()
    const position = rfInstance.screenToFlowPosition({ x:e.clientX-bounds.left, y:e.clientY-bounds.top })
    const id       = mkId(typeKey)
    const rtInit   = RUNTIME_CONFIG_ELEMENTS.has(typeKey) ? (typeKey==='logo_inserter' ? {x_pos:0,y_pos:0} : {}) : null
    const cfgInit  = typeKey === 'srt_output' ? { destinations: { 'out_1': { addr:'0.0.0.0', port:9001, mode:'caller', latency:null, passphrase:null, stream_id:null, max_clients:10 } } } : {}
    setNodes(nds => nds.concat({ id, type:resolveType(typeKey), position, data:{ typeKey, label:ELEMENTS[typeKey]?.name||typeKey, config:{}, runtime_config:rtInit, nodeId:id } }))
  }, [rfInstance, setNodes])

  const addNode = useCallback(typeKey => {
    if (!activePipelineId) { alert('Select or create a pipeline first'); return }
    const id    = mkId(typeKey)
    const rtInit = RUNTIME_CONFIG_ELEMENTS.has(typeKey) ? (typeKey==='logo_inserter' ? {x_pos:0,y_pos:0} : {}) : null
    setNodes(nds => nds.concat({ id, type:resolveType(typeKey), position:{ x:200+Math.random()*300, y:100+Math.random()*200 }, data:{ typeKey, label:ELEMENTS[typeKey]?.name||typeKey, config:{}, runtime_config:rtInit, nodeId:id } }))
  }, [activePipelineId, setNodes])

  // ── Config save ───────────────────────────────────────────────────────────
  const saveConfig = useCallback((nodeId, newElemId, config, runtimeConfig) => {
    setNodes(nds => nds.map(n => {
      if (n.id!==nodeId) return n
      return { ...n, id:newElemId, data:{ ...n.data, config, runtime_config:runtimeConfig, nodeId:newElemId } }
    }))
    if (nodeId!==newElemId) {
      deletedNodeIds.current.add(nodeId)
      setEdges(eds => eds.map(e => ({ ...e, source:e.source===nodeId?newElemId:e.source, target:e.target===nodeId?newElemId:e.target })))
    }
  }, [setNodes, setEdges])

  // ── Current pipeline JSON for editor ─────────────────────────────────────
  const currentPipelineJson = React.useMemo(() => {
    if (!activePipelineId || !pipelineMeta) return null
    try {
      return canvasToApiPipeline(
        { ...pipelineMeta, viewport: null },
        nodes, edges,
        deletedNodeIds.current,
        deletedEdgeIds.current
      )
    } catch { return null }
  }, [nodes, edges, pipelineMeta, activePipelineId])

  // ── Canvas watermark ──────────────────────────────────────────────────────
  const canvasBrand = (
    <div style={{ position:'absolute', top:14, left:14, pointerEvents:'none', zIndex:5, display:'flex', alignItems:'center', gap:8, opacity:0.07 }}>
      <img src="/moxela-icon.png" alt="" width={22} style={{ filter:'brightness(10)' }} />
      <svg height={13} viewBox="396 332 125 32" xmlns="http://www.w3.org/2000/svg"><g transform="translate(397,332.052)"><path d="M13.1896 12.4977 21.9924 21.2076 22.0388 21.2076 30.8416 12.4977 30.8416 30.7536 27.5435 30.7536 27.5667 20.1391 27.4737 20.1391 22.0156 25.667 16.5574 20.1391 16.4644 20.1391 16.4877 30.7536 13.1896 30.7536Z" fill="white"/><path d="M42.1055 31.1484C36.9259 31.1484 32.7685 27.1999 32.7685 22.0437 32.7685 16.8874 36.9259 12.9389 42.1055 12.9389 47.2617 12.9389 51.4425 16.8874 51.4425 22.0437 51.4425 27.1999 47.2617 31.1484 42.1055 31.1484ZM42.1055 16.028C38.8306 16.028 36.206 18.7687 36.206 22.0437 36.206 25.3419 38.8306 28.0592 42.1055 28.0592 45.4036 28.0592 48.005 25.3419 48.005 22.0437 48.005 18.7687 45.4036 16.028 42.1055 16.028Z" fill="white"/><path d="M66.5527 30.7536 62.6043 30.7536 58.9114 24.8773 58.8184 24.8773 55.1021 30.7536 51.1536 30.7536 56.7746 22.0437 51.1536 13.3337 55.1021 13.3337 58.8184 19.2332 58.9114 19.2332 62.6043 13.3337 66.5527 13.3337 60.932 22.0437Z" fill="white"/><path d="M80.4902 27.5947 80.4902 30.7536 67.6924 30.7536 67.6924 13.3337 80.4902 13.3337 80.4902 16.4926 70.9908 16.4926 70.9908 20.4411 78.8877 20.4411 78.8877 23.5998 70.9908 23.5998 70.9908 27.5947Z" fill="white"/><path d="M94.4371 30.7536 82.4523 30.7536 82.4523 13.3337 85.7504 13.3337 85.7504 27.5947 94.4371 27.5947Z" fill="white"/><path d="M107.085 28.2916 99.9085 28.2916 98.84 30.7536 95.0541 30.7536 103.508 12.4977 111.94 30.7536 108.154 30.7536 107.085 28.2916ZM101.256 25.2025 105.738 25.2025 103.555 20.1391 103.462 20.1391Z" fill="white"/></g></svg>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <TopBar
        pipeline={pipelineMeta} onSave={saveToBackend} onLoad={loadFromBackend}
        onJsonEditor={() => setShowJsonEditor(true)}
        saving={saving} saveStatus={saveStatus}
        username={user.username} onLogout={onLogout}
        nodeCount={nodes.length} edgeCount={edges.length}
      />
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <Sidebar onAddNode={addNode} pipelines={pipelines} activePipeline={activePipelineId}
          onSelectPipeline={id => selectPipeline(id)} onNewPipeline={() => setShowPipelineModal(true)} onDeletePipeline={deletePipeline} />
        <div ref={wrapRef} style={{ flex:1, height:'100%', position:'relative' }}>
          {!activePipelineId && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5, pointerEvents:'none' }}>
              <div style={{ textAlign:'center', color:'#1e3050' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>⬡</div>
                <div style={{ fontSize:14, fontWeight:600 }}>Select a pipeline or create a new one</div>
                <div style={{ fontSize:11, marginTop:6 }}>Use the Pipelines tab in the sidebar</div>
              </div>
            </div>
          )}
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange}
            onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver}
            onInit={setRfInstance}
            onNodeDragStart={onNodeDragStart} onNodeDragStop={onNodeDragStop}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView fitViewOptions={{ padding:0.15 }}
            deleteKeyCode={['Backspace','Delete']}
            defaultEdgeOptions={{ type:'default', animated:true, style:{ stroke:'#78BE20', strokeDasharray:'6 3.5' } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#18273a" />
            <Controls style={{ bottom:100, left:12 }} />
            <MiniMap nodeColor={n => ELEMENTS[n.data?.typeKey]?.stripe||'#1a2e44'} maskColor="rgba(9,15,24,0.7)" style={{ bottom:32, right:12 }} />
          </ReactFlow>
          {canvasBrand}
          <TrashBin onDropNode={deleteNodeById} draggingNodeId={draggingNodeId} />
          {configNode && (
            <ConfigPanel node={configNode} nodeId={configNodeId}
              onClose={() => { setConfigNode(null); setConfigNodeId(null) }}
              onSave={saveConfig} />
          )}
          {showJsonEditor && currentPipelineJson && (
            <JsonEditorModal
              pipeline={currentPipelineJson}
              pipelineId={activePipelineId}
              onClose={() => setShowJsonEditor(false)}
              onApply={handleJsonApply}
            />
          )}
        </div>
      </div>
      {showPipelineModal && <PipelineModal onSave={createPipeline} onClose={() => setShowPipelineModal(false)} />}
      {loading && (
        <div style={{ position:'fixed', bottom:20, right:20, background:'#0e1826', border:'1px solid #1e3050', borderRadius:8, padding:'10px 16px', fontSize:12, color:'#78BE20', zIndex:300 }}>Loading from backend…</div>
      )}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  if (!user) return <LoginScreen onLogin={setUser} />
  return (
    <ReactFlowProvider>
      <FlowCanvas user={user} onLogout={() => setUser(null)} />
    </ReactFlowProvider>
  )
}
