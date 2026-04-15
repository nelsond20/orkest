import { useEffect, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { getNodeConfigDefinition } from '../../nodes/node-config-registry'
import type { WorkflowNode } from '../../engine/workflow.types'
import { Button } from '../../components/ui/Button'

interface ConfigPanelProps {
  selectedNode?: WorkflowNode
  errors: string[]
  onApplyConfig: (nodeId: string, config: Record<string, unknown>) => void
  onDeleteNode: (nodeId: string) => void
}

export function ConfigPanel({ selectedNode, errors, onApplyConfig, onDeleteNode }: ConfigPanelProps) {
  const [draft, setDraft] = useState('')
  const [parseError, setParseError] = useState<string>()

  useEffect(() => {
    if (!selectedNode) {
      setDraft('')
      setParseError(undefined)
      return
    }

    setDraft(JSON.stringify(selectedNode.config, null, 2))
    setParseError(undefined)
  }, [selectedNode])

  if (!selectedNode) {
    return (
      <Panel className="h-full" title="Config">
        <p className="text-xs text-slate-400">Select a node to edit its configuration.</p>
      </Panel>
    )
  }

  const schema = getNodeConfigDefinition(selectedNode.type).configSchema

  const applyConfig = () => {
    try {
      const parsed = JSON.parse(draft) as Record<string, unknown>
      const result = schema.safeParse(parsed)

      if (!result.success) {
        setParseError(result.error.issues[0]?.message ?? 'Invalid config payload.')
        return
      }

      setParseError(undefined)
      onApplyConfig(selectedNode.id, parsed)
    } catch {
      setParseError('Invalid JSON format.')
    }
  }

  return (
    <Panel className="h-full" title="Config">
      <div className="space-y-3">
        <div className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
          <p>Node: {selectedNode.id}</p>
          <p>Type: {selectedNode.type}</p>
        </div>

        <textarea
          className="h-[260px] w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-slate-100 outline-none focus:border-blue-500"
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />

        {parseError ? <p className="text-xs text-red-400">{parseError}</p> : null}

        {errors.length > 0 ? (
          <ul className="space-y-1 text-xs text-red-400">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex gap-2">
          <Button onClick={applyConfig}>Apply Config</Button>
          <Button onClick={() => onDeleteNode(selectedNode.id)} variant="ghost">
            Delete Node
          </Button>
        </div>
      </div>
    </Panel>
  )
}
