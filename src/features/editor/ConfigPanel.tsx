import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import type { WorkflowNode } from '../../engine/workflow.types'
import { Button } from '../../components/ui/Button'
import { getNodeConfigDefinition } from '../../nodes/node-config-registry'
import { TriggerConfigForm } from '../../nodes/trigger/TriggerConfigForm'
import { ConditionConfigForm } from '../../nodes/condition/ConditionConfigForm'
import { ActionConfigForm } from '../../nodes/action/ActionConfigForm'
import { DelayConfigForm } from '../../nodes/delay/DelayConfigForm'
import { BranchConfigForm } from '../../nodes/branch/BranchConfigForm'
import { RetryConfigForm } from '../../nodes/retry/RetryConfigForm'
import { EndConfigForm } from '../../nodes/end/EndConfigForm'
import type { TriggerConfig } from '../../nodes/trigger/trigger.types'
import type { ConditionConfig } from '../../nodes/condition/condition.types'
import type { ActionConfig } from '../../nodes/action/action.types'
import type { DelayConfig } from '../../nodes/delay/delay.types'
import type { BranchConfig } from '../../nodes/branch/branch.types'
import type { RetryConfig } from '../../nodes/retry/retry.types'
import type { EndConfig } from '../../nodes/end/end.types'

interface ConfigPanelProps {
  selectedNode?: WorkflowNode
  errors: string[]
  onApplyConfig: (nodeId: string, config: Record<string, unknown>) => void
  onDeleteNode: (nodeId: string) => void
}

type DraftConfig =
  | TriggerConfig
  | ConditionConfig
  | ActionConfig
  | DelayConfig
  | BranchConfig
  | RetryConfig
  | EndConfig

export function ConfigPanel({ selectedNode, errors, onApplyConfig, onDeleteNode }: ConfigPanelProps) {
  const [draftConfig, setDraftConfig] = useState<DraftConfig | null>(null)
  const [parseError, setParseError] = useState<string>()

  const configSchema = useMemo(() => {
    if (!selectedNode) {
      return undefined
    }

    return getNodeConfigDefinition(selectedNode.type).configSchema
  }, [selectedNode])

  useEffect(() => {
    if (!selectedNode) {
      setDraftConfig(null)
      setParseError(undefined)
      return
    }

    const definition = getNodeConfigDefinition(selectedNode.type)
    const parsedConfig = definition.configSchema.safeParse(selectedNode.config)

    if (parsedConfig.success) {
      setDraftConfig(structuredClone(parsedConfig.data) as unknown as DraftConfig)
      setParseError(undefined)
      return
    }

    setDraftConfig(structuredClone(definition.defaultConfig) as unknown as DraftConfig)
    setParseError('Current node config is invalid. Defaults are shown until you apply a valid config.')
  }, [selectedNode])

  if (!selectedNode || !draftConfig || !configSchema) {
    return (
      <Panel className="h-full" title="Config">
        <p className="text-xs text-[var(--text-3)]">Select a node to edit its configuration.</p>
      </Panel>
    )
  }

  const updateDraft = (nextConfig: DraftConfig) => {
    setDraftConfig(nextConfig)
    const validationResult = configSchema.safeParse(nextConfig)

    if (!validationResult.success) {
      setParseError(validationResult.error.issues[0]?.message ?? 'Invalid config payload.')
      return
    }

    setParseError(undefined)
    onApplyConfig(selectedNode.id, nextConfig as unknown as Record<string, unknown>)
  }

  const renderForm = () => {
    switch (selectedNode.type) {
      case 'trigger':
        return <TriggerConfigForm onChange={updateDraft} value={draftConfig as TriggerConfig} />
      case 'condition':
        return <ConditionConfigForm onChange={updateDraft} value={draftConfig as ConditionConfig} />
      case 'action':
        return <ActionConfigForm onChange={updateDraft} value={draftConfig as ActionConfig} />
      case 'delay':
        return <DelayConfigForm onChange={updateDraft} value={draftConfig as DelayConfig} />
      case 'branch':
        return <BranchConfigForm onChange={updateDraft} value={draftConfig as BranchConfig} />
      case 'retry':
        return <RetryConfigForm onChange={updateDraft} value={draftConfig as RetryConfig} />
      case 'end':
        return <EndConfigForm onChange={updateDraft} value={draftConfig as EndConfig} />
      default:
        return <p className="text-xs text-[var(--text-3)]">Unsupported node type.</p>
    }
  }

  return (
    <Panel className="h-full" title="Config">
      <div className="space-y-3">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
          <p className="text-xs text-[var(--text-3)] uppercase tracking-[0.1em]">Node ID</p>
          <p className="mt-0.5 text-xs font-medium text-[var(--text-2)]">{selectedNode.id}</p>
          <p className="mt-2 text-xs text-[var(--text-3)] uppercase tracking-[0.1em]">Type</p>
          <p className="mt-0.5 text-xs font-medium text-[var(--text-2)]">{selectedNode.type}</p>
        </div>

        {renderForm()}

        {parseError ? <p className="text-sm text-[var(--destructive)]">{parseError}</p> : null}

        {errors.length > 0 ? (
          <ul className="space-y-1 text-sm text-[var(--destructive)]">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}

        <Button onClick={() => onDeleteNode(selectedNode.id)} variant="danger">
          Delete Node
        </Button>
      </div>
    </Panel>
  )
}
