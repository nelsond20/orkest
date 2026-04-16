import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import type { RetryConfig } from './retry.types'

export function RetryNode({ data }: NodeProps<RetryConfig>) {
  return (
    <>
      <Handle position={Position.Left} type="target" />
      <NodeCard
        accentClassName="bg-orange-500"
        subtitle={`${data.maxAttempts} attempts, ${data.delaySeconds}s delay`}
        title="Retry"
      />
      <span className="pointer-events-none absolute right-3 top-[26%] text-[10px] uppercase text-slate-400">exhausted</span>
      <span className="pointer-events-none absolute right-3 top-[56%] text-[10px] uppercase text-slate-400">success</span>
      <Handle id="exhausted" position={Position.Right} style={{ top: '35%' }} type="source" />
      <Handle id="success" position={Position.Right} style={{ top: '65%' }} type="source" />
    </>
  )
}
