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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-[var(--success-bg)] text-[var(--success)]',
    failed: 'bg-[var(--destructive-bg)] text-[var(--destructive)]',
    cancelled: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    running: 'bg-[var(--accent-bg)] text-[var(--accent)]',
    succeeded: 'bg-[var(--success-bg)] text-[var(--success)]',
  }
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${styles[status] ?? 'bg-[var(--surface-2)] text-[var(--text-3)]'}`}>
      {status || 'idle'}
    </span>
  )
}

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
    className: activeNodeId === node.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--bg)] rounded-md' : undefined
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
    return <p className="text-sm text-[var(--text-3)]">Workflow not found for simulator.</p>
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
          <Button data-testid="next-step-button" onClick={step} variant="secondary">
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
            variant="secondary"
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
            variant="secondary"
          >
            Guided Auto-run
          </Button>
          <Button data-testid="reset-run-button" onClick={reset} variant="ghost">
            Reset
          </Button>
        </div>
        {runError ? (
          <div className="mb-3 rounded-lg border border-[var(--destructive-border,rgba(239,68,68,0.25))] bg-[var(--destructive-bg)] px-4 py-3 text-sm text-[var(--destructive)]" data-testid="run-error-text">
            {runError}
          </div>
        ) : null}

        <div className="h-[66vh] rounded-md border border-[var(--border)] bg-[var(--surface)]">
          <ReactFlow edges={edges} fitView nodeTypes={nodeTypes} nodes={nodes} nodesDraggable={false} nodesConnectable={false}>
            <Background color="#1a2535" gap={18} />
          </ReactFlow>
        </div>
      </Panel>

      <div className="space-y-3">
        <Panel title="Mock Input">
          <textarea
            className="h-36 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-xs text-[var(--text)] outline-none transition-colors duration-[120ms] focus:border-[var(--accent)]"
            onChange={(event) => setMockInputText(event.target.value)}
            value={mockInputText}
          />
          {mockInputError ? <p className="mt-2 text-sm text-[var(--destructive)]">{mockInputError}</p> : null}
        </Panel>

        <Panel title="Run Status">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--text-3)]">Workflow</span>
              <span className="text-sm text-[var(--text-2)]">{workflow.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--text-3)]">Status</span>
              <StatusBadge status={run?.status ?? 'idle'} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--text-3)]">Active Node</span>
              <span className="text-sm text-[var(--text-2)]" data-testid="run-status-text">{activeNodeId ?? '—'}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Step Log">
          <StepLog steps={run?.steps ?? []} />
        </Panel>
      </div>
    </div>
  )
}
