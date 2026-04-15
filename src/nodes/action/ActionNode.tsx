import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import type { ActionConfig } from './action.types'

export function ActionNode({ data }: NodeProps<ActionConfig>) {
  return (
    <>
      <Handle position={Position.Left} type="target" />
      <NodeCard accentClassName="bg-green-500" subtitle={`Action: ${data.actionType}`} title="Action" />
      <Handle id="success" position={Position.Right} style={{ top: '35%' }} type="source" />
      <Handle id="failed" position={Position.Right} style={{ top: '65%' }} type="source" />
    </>
  )
}
