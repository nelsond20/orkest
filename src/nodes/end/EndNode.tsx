import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import type { EndConfig } from './end.types'

export function EndNode({ data }: NodeProps<EndConfig>) {
  return (
    <>
      <Handle position={Position.Left} type="target" />
      <NodeCard accentClassName="bg-slate-400" subtitle={`Result: ${data.result}`} title="End" />
    </>
  )
}
