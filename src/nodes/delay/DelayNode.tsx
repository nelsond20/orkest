import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import type { DelayConfig } from './delay.types'

export function DelayNode({ data }: NodeProps<DelayConfig>) {
  return (
    <>
      <Handle position={Position.Left} type="target" />
      <NodeCard accentClassName="bg-violet-500" subtitle={`${data.duration} ${data.unit}`} title="Delay" />
      <Handle position={Position.Right} type="source" />
    </>
  )
}
