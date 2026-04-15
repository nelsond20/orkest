import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import type { ConditionConfig } from './condition.types'

export function ConditionNode({ data }: NodeProps<ConditionConfig>) {
  return (
    <>
      <Handle position={Position.Left} type="target" />
      <NodeCard
        accentClassName="bg-amber-500"
        subtitle={`${data.field} ${data.operator} ${String(data.value)}`}
        title="Condition"
      />
      <Handle id="true" position={Position.Right} style={{ top: '35%' }} type="source" />
      <Handle id="false" position={Position.Right} style={{ top: '65%' }} type="source" />
    </>
  )
}
