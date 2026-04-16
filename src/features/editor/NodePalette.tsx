import type { NodeType } from '../../engine/workflow.types'
import { nodeDefinitions } from '../../nodes/node-registry'
import { Panel } from '../../components/ui/Panel'

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void
}

const paletteOrder: NodeType[] = ['trigger', 'condition', 'action', 'delay', 'branch', 'retry', 'end']

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <Panel className="h-full" title="Node Palette">
      <div className="space-y-2">
        {paletteOrder.map((type) => {
          const definition = nodeDefinitions[type]

          return (
            <button
              data-testid={`palette-node-${type}`}
              key={type}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-left text-xs text-slate-200 hover:border-slate-600"
              draggable
              onClick={() => onAddNode(type)}
              onDragStart={(event) => {
                event.dataTransfer.setData('application/orderflow-node-type', type)
                event.dataTransfer.effectAllowed = 'move'
              }}
              type="button"
            >
              <p className="font-semibold">{definition.meta.label}</p>
              <p className="mt-1 text-[11px] text-slate-400">{definition.meta.description}</p>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
