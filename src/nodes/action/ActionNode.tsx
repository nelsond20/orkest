import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import type { ActionConfig } from './action.types'

export function ActionNode({ data }: NodeProps<ActionConfig>) {
  return (
    <>
      <Handle position={Position.Left} type="target" />
      <NodeCard accentClassName="bg-green-500" subtitle={`Action: ${data.actionType}`} title="Action" />
      <span className="pointer-events-none absolute right-3 top-[26%] text-[10px] uppercase text-slate-400">success</span>
      <span className="pointer-events-none absolute right-3 top-[56%] text-[10px] uppercase text-slate-400">failed</span>
      <Handle id="success" position={Position.Right} style={{ top: '35%' }} type="source" />
      <Handle id="failed" position={Position.Right} style={{ top: '65%' }} type="source" />
    </>
  )
}
