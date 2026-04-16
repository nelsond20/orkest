import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { NodeType, WorkflowEdge, WorkflowNode } from '../../engine/workflow.types'
import { nodeDefinitions } from '../../nodes/node-registry'
import { JsonViewPanel } from '../json-view/JsonViewPanel'
import { ConfigPanel } from './ConfigPanel'
import { useEditorStore } from './editor.store'
import { EditorToolbar } from './EditorToolbar'
import { NodePalette } from './NodePalette'

function asReactFlowNode(node: WorkflowNode, hasError: boolean): Node {
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.config,
    className: hasError ? 'node-error ring-2 ring-red-500 ring-offset-2 ring-offset-slate-950 rounded-md' : undefined
  }
}

function asReactFlowEdge(edge: WorkflowEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    animated: edge.sourceHandle === 'failed'
  }
}

function asWorkflowNode(node: Node, previous: WorkflowNode | undefined): WorkflowNode {
  return {
    id: node.id,
    type: (node.type as NodeType) ?? previous?.type ?? 'action',
    position: node.position,
    config: (node.data as Record<string, unknown>) ?? previous?.config ?? {}
  }
}

function asWorkflowEdge(edge: Edge): WorkflowEdge {
  return {
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle ?? undefined,
    target: edge.target
  }
}

function isValidConnection(connection: Connection, nodesById: Map<string, WorkflowNode>, edges: WorkflowEdge[]): boolean {
  if (!connection.source || !connection.target) {
    return false
  }

  if (connection.source === connection.target) {
    return false
  }

  const sourceNode = nodesById.get(connection.source)
  const targetNode = nodesById.get(connection.target)

  if (!sourceNode || !targetNode) {
    return false
  }

  if (sourceNode.type === 'end' || targetNode.type === 'trigger') {
    return false
  }

  const duplicatedEdge = edges.some(
    (edge) =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === (connection.sourceHandle ?? undefined)
  )

  if (duplicatedEdge) {
    return false
  }

  if (sourceNode.type === 'condition' && connection.sourceHandle !== 'true' && connection.sourceHandle !== 'false') {
    return false
  }

  if (sourceNode.type === 'branch' && connection.sourceHandle !== 'branch-a' && connection.sourceHandle !== 'branch-b') {
    return false
  }

  if (sourceNode.type === 'action' && connection.sourceHandle === 'failed' && targetNode.type !== 'retry') {
    return false
  }

  return true
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'json' ? 'json' : 'canvas'
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)

  const {
    workflow,
    selectedNodeId,
    validation,
    jsonSync,
    loadWorkflow,
    updateWorkflowName,
    addNode,
    setNodes,
    setEdges,
    setSelectedNode,
    updateNodeConfig,
    deleteNode,
    saveWorkflow,
    validate,
    exportJson,
    setJsonDraft,
    importJson
  } = useEditorStore()

  useEffect(() => {
    if (!id) {
      return
    }

    loadWorkflow(id)
  }, [id, loadWorkflow])

  const errorsByNode = useMemo(() => {
    const grouped = new Map<string, string[]>()

    for (const issue of validation?.errors ?? []) {
      const current = grouped.get(issue.nodeId) ?? []
      grouped.set(issue.nodeId, [...current, issue.message])
    }

    return grouped
  }, [validation])

  const nodeTypes = useMemo(() => {
    return Object.fromEntries(Object.entries(nodeDefinitions).map(([type, definition]) => [type, definition.component]))
  }, [])

  const nodes = useMemo(() => {
    if (!workflow) {
      return []
    }

    return workflow.nodes.map((node) => asReactFlowNode(node, (errorsByNode.get(node.id)?.length ?? 0) > 0))
  }, [workflow, errorsByNode])

  const edges = useMemo(() => {
    if (!workflow) {
      return []
    }

    return workflow.edges.map(asReactFlowEdge)
  }, [workflow])

  const nodesById = useMemo(() => {
    return new Map((workflow?.nodes ?? []).map((node) => [node.id, node]))
  }, [workflow])

  const selectedNode = useMemo(() => {
    if (!workflow || !selectedNodeId) {
      return undefined
    }

    return workflow.nodes.find((node) => node.id === selectedNodeId)
  }, [workflow, selectedNodeId])

  if (!workflow) {
    return <p className="text-sm text-slate-400">Workflow not found.</p>
  }

  const buildDownloadFileName = (name: string): string => {
    const normalized = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return `${normalized || 'workflow'}.json`
  }

  const handleAddNode = (type: NodeType) => {
    if (flowInstance && canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect()
      const position = flowInstance.screenToFlowPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
      addNode(type, position)
      return
    }

    if (selectedNode) {
      addNode(type, {
        x: selectedNode.position.x + 220,
        y: selectedNode.position.y + 40
      })
      return
    }

    addNode(type, { x: 180, y: 180 })
  }

  const handleNodesChange = (changes: NodeChange[]) => {
    const persistedChanges = changes.filter((change) => change.type === 'position' || change.type === 'remove')
    if (persistedChanges.length === 0) {
      return
    }

    const latestWorkflow = useEditorStore.getState().workflow
    if (!latestWorkflow) {
      return
    }

    const latestNodesById = new Map(latestWorkflow.nodes.map((node) => [node.id, node]))
    const latestNodes = latestWorkflow.nodes.map((node) => asReactFlowNode(node, false))

    const updatedNodes = applyNodeChanges(persistedChanges, latestNodes)
      .filter((node) => !node.hidden)
      .map((node) => asWorkflowNode(node, latestNodesById.get(node.id)))

    setNodes(updatedNodes)
  }

  const handleEdgesChange = (changes: EdgeChange[]) => {
    const persistedChanges = changes.filter((change) => change.type !== 'select')
    if (persistedChanges.length === 0) {
      return
    }

    const latestWorkflow = useEditorStore.getState().workflow
    if (!latestWorkflow) {
      return
    }

    const latestEdges = latestWorkflow.edges.map(asReactFlowEdge)
    const updatedEdges = applyEdgeChanges(persistedChanges, latestEdges).map(asWorkflowEdge)
    setEdges(updatedEdges)
  }

  const handleConnect = (connection: Connection) => {
    const latestWorkflow = useEditorStore.getState().workflow
    if (!latestWorkflow) {
      return
    }

    const latestNodesById = new Map(latestWorkflow.nodes.map((node) => [node.id, node]))

    if (!isValidConnection(connection, latestNodesById, latestWorkflow.edges)) {
      return
    }

    const latestEdges = latestWorkflow.edges.map(asReactFlowEdge)

    const nextEdge = addEdge(
      {
        ...connection,
        id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        animated: connection.sourceHandle === 'failed'
      },
      latestEdges
    )

    setEdges(nextEdge.map(asWorkflowEdge))
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const type = event.dataTransfer.getData('application/orderflow-node-type') as NodeType | ''
    if (!type || !flowInstance) {
      return
    }

    const position = flowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    addNode(type, position)
  }

  const canvas = (
    <div
      ref={canvasContainerRef}
      className="rounded-lg border border-slate-800 bg-slate-900/70"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <ReactFlow
        edges={edges}
        fitView
        isValidConnection={(connection) => isValidConnection(connection, nodesById, workflow.edges)}
        nodeTypes={nodeTypes}
        nodes={nodes}
        onConnect={handleConnect}
        onEdgesChange={handleEdgesChange}
        onInit={setFlowInstance}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onNodesChange={handleNodesChange}
      >
        <Background color="#334155" gap={18} />
      </ReactFlow>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar
        activeTab={activeTab}
        onExportJson={async () => {
          const json = exportJson()
          const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
          const downloadUrl = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = downloadUrl
          anchor.download = buildDownloadFileName(workflow.name)
          document.body.appendChild(anchor)
          anchor.click()
          document.body.removeChild(anchor)
          URL.revokeObjectURL(downloadUrl)
        }}
        onFitView={() => flowInstance?.fitView({ padding: 0.1 })}
        onImportJson={() => {
          const nextJson = window.prompt('Paste workflow JSON')
          if (!nextJson) {
            return
          }

          importJson(nextJson)
        }}
        onRun={() => {
          saveWorkflow()
          navigate(`/runs/${workflow.id}`)
        }}
        onSave={saveWorkflow}
        onTabChange={(nextTab) => {
          if (nextTab === 'canvas') {
            searchParams.delete('tab')
            setSearchParams(searchParams)
            return
          }

          setSearchParams({ tab: 'json' })
        }}
        onValidate={() => {
          validate()
        }}
        onWorkflowNameChange={updateWorkflowName}
        workflowName={workflow.name}
      />

      {activeTab === 'json' ? (
        <div className="grid flex-1 grid-cols-[1fr_420px] gap-3">
          {canvas}
          <JsonViewPanel
            error={jsonSync.error}
            onApply={() => {
              importJson(jsonSync.draft)
            }}
            onChange={setJsonDraft}
            onCopy={async () => {
              await navigator.clipboard.writeText(jsonSync.draft)
            }}
            onImportClipboard={async () => {
              const clipboardText = await navigator.clipboard.readText()
              setJsonDraft(clipboardText)
              importJson(clipboardText)
            }}
            value={jsonSync.draft}
          />
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-[260px_1fr_320px] gap-3">
          <NodePalette onAddNode={handleAddNode} />
          {canvas}
          <ConfigPanel
            errors={selectedNodeId ? errorsByNode.get(selectedNodeId) ?? [] : []}
            onApplyConfig={updateNodeConfig}
            onDeleteNode={deleteNode}
            selectedNode={selectedNode}
          />
        </div>
      )}

    </div>
  )
}
