import { useEffect, useMemo, useState } from 'react'
import ReactFlow, { Background, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import type { WorkflowDef } from '../../engine/workflow.types'
import { persistence } from '../../lib/persistence/persistence'
import { nodeDefinitions } from '../../nodes/node-registry'
import { useSimulatorStore } from './simulator.store'
import { StepLog } from './StepLog'

function asReadOnlyNode(workflow: WorkflowDef | undefined, nodeId: string, activeNodeId?: string): Node | undefined {
  const node = workflow?.nodes.find((item) => item.id === nodeId)

  if (!node) {
    return undefined
  }

  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.config,
    draggable: false,
    className: activeNodeId === node.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 rounded-md' : undefined
  }
}

function asReadOnlyEdge(workflow: WorkflowDef | undefined, edgeId: string): Edge | undefined {
  const edge = workflow?.edges.find((item) => item.id === edgeId)

  if (!edge) {
    return undefined
  }

  return {
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    animated: edge.sourceHandle === 'failed'
  }
}

export function SimulatorPage() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const navigate = useNavigate()
  const [workflow, setWorkflow] = useState<WorkflowDef | undefined>()
  const [mockInputText, setMockInputText] = useState('{\n  "amount": 1500\n}')
  const [mockInputError, setMockInputError] = useState<string>()

  const { run, activeNodeId, runError, start, step, reset, setMockInput } = useSimulatorStore()

  useEffect(() => {
    if (!workflowId) {
      return
    }

    setWorkflow(persistence.getWorkflowById(workflowId))
  }, [workflowId])

  const nodeTypes = useMemo(() => {
    return Object.fromEntries(Object.entries(nodeDefinitions).map(([type, definition]) => [type, definition.component]))
  }, [])

  const nodes = useMemo(() => {
    if (!workflow) {
      return []
    }

    return workflow.nodes
      .map((node) => asReadOnlyNode(workflow, node.id, activeNodeId))
      .filter((node): node is Node => Boolean(node))
  }, [workflow, activeNodeId])

  const edges = useMemo(() => {
    if (!workflow) {
      return []
    }

    return workflow.edges.map((edge) => asReadOnlyEdge(workflow, edge.id)).filter((edge): edge is Edge => Boolean(edge))
  }, [workflow])

  if (!workflow) {
    return <p className="text-sm text-slate-400">Workflow not found for simulator.</p>
  }

  const applyMockInput = () => {
    try {
      const parsed = JSON.parse(mockInputText) as Record<string, unknown>
      setMockInput(parsed)
      setMockInputError(undefined)
      return true
    } catch {
      setMockInputError('Invalid mock input JSON.')
      return false
    }
  }

  return (
    <div className="grid h-full grid-cols-[1fr_380px] gap-3">
      <Panel className="h-full" title="Simulator Canvas">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            data-testid="back-to-editor-button"
            onClick={() => navigate(`/editor/${workflow.id}`)}
            variant="ghost"
          >
            Back to Editor
          </Button>
          <Button
            data-testid="start-step-mode-button"
            onClick={async () => {
              if (!applyMockInput()) {
                return
              }

              await start(workflow, 'step')
            }}
            variant="primary"
          >
            Start Step-by-step
          </Button>
          <Button data-testid="next-step-button" onClick={step}>
            Next Step
          </Button>
          <Button
            data-testid="start-auto-mode-button"
            onClick={async () => {
              if (!applyMockInput()) {
                return
              }

              await start(workflow, 'auto')
            }}
          >
            Auto-run
          </Button>
          <Button
            data-testid="start-guided-mode-button"
            onClick={async () => {
              if (!applyMockInput()) {
                return
              }

              await start(workflow, 'guided')
            }}
          >
            Guided Auto-run
          </Button>
          <Button data-testid="reset-run-button" onClick={reset} variant="ghost">
            Reset
          </Button>
        </div>
        {runError ? (
          <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300" data-testid="run-error-text">
            {runError}
          </p>
        ) : null}

        <div className="h-[66vh] rounded-md border border-slate-800 bg-slate-950">
          <ReactFlow edges={edges} fitView nodeTypes={nodeTypes} nodes={nodes} nodesDraggable={false} nodesConnectable={false}>
            <Background color="#334155" gap={18} />
          </ReactFlow>
        </div>
      </Panel>

      <div className="space-y-3">
        <Panel title="Mock Input">
          <textarea
            className="h-36 w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-slate-100"
            onChange={(event) => setMockInputText(event.target.value)}
            value={mockInputText}
          />
          {mockInputError ? <p className="mt-2 text-xs text-red-400">{mockInputError}</p> : null}
        </Panel>

        <Panel title="Run Status">
          <p className="text-xs text-slate-300">Workflow: {workflow.name}</p>
          <p className="mt-1 text-xs text-slate-300" data-testid="run-status-text">
            Run status: {run?.status ?? 'idle'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Active node: {activeNodeId ?? 'none'}</p>
          {runError ? <p className="mt-2 text-xs text-red-300">Simulation blocked by validation errors.</p> : null}
        </Panel>

        <Panel title="Step Log">
          <StepLog steps={run?.steps ?? []} />
        </Panel>
      </div>
    </div>
  )
}
