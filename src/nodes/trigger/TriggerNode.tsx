import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import type { TriggerConfig } from './trigger.types'

export function TriggerNode({ data }: NodeProps<TriggerConfig>) {
  return (
    <>
      <NodeCard accentClassName="bg-blue-500" subtitle={`Event: ${data.eventType}`} title="Trigger" />
      <Handle id="next" position={Position.Right} type="source" />
    </>
  )
}
