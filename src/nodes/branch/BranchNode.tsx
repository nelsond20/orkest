import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { NodeCard } from '../shared/NodeCard'
import { defaultBranchConfig } from './branch.config'
import type { BranchConfig } from './branch.types'

export function BranchNode({ data }: NodeProps<BranchConfig>) {
  const options =
    Array.isArray(data?.options) && data.options.length >= 2
      ? data.options
      : defaultBranchConfig.options

  return (
    <>
      <Handle position={Position.Left} type="target" />
      <NodeCard accentClassName="bg-fuchsia-500" subtitle="Explicit branch selector" title="Branch">
        <div className="mt-2 space-y-1 text-[11px] text-slate-300">
          <div className="truncate">
            A: {options[0]?.label ?? 'Primary path'}
          </div>
          <div className="truncate">
            B: {options[1]?.label ?? 'Alternative path'}
          </div>
        </div>
      </NodeCard>
      <span className="pointer-events-none absolute -right-5 top-[26%] rounded bg-slate-950/90 px-1 text-[10px] uppercase text-slate-300">
        A
      </span>
      <span className="pointer-events-none absolute -right-5 top-[56%] rounded bg-slate-950/90 px-1 text-[10px] uppercase text-slate-300">
        B
      </span>
      <Handle id="branch-a" position={Position.Right} style={{ top: '35%' }} type="source" />
      <Handle id="branch-b" position={Position.Right} style={{ top: '65%' }} type="source" />
    </>
  )
}
