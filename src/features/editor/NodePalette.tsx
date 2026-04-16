import type { NodeType } from '../../engine/workflow.types'
import { nodeDefinitions } from '../../nodes/node-registry'
import { Panel } from '../../components/ui/Panel'

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void
}

const paletteOrder: NodeType[] = ['trigger', 'condition', 'action', 'delay', 'branch', 'retry', 'end']

const nodeColors: Record<string, string> = {
  trigger: '#3b82f6',
  action: '#22c55e',
  condition: '#f59e0b',
  delay: '#8b5cf6',
  branch: '#d946ef',
  retry: '#f97316',
  end: '#64748b',
}

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
              className="group relative w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-left transition-all duration-[120ms] hover:border-[var(--accent-border)] hover:bg-[var(--surface-2)] cursor-grab active:cursor-grabbing"
              draggable
              onClick={() => onAddNode(type)}
              onDragStart={(event) => {
                event.dataTransfer.setData('application/orderflow-node-type', type)
                event.dataTransfer.effectAllowed = 'move'
              }}
              type="button"
            >
              <div
                className="absolute left-0 top-0 h-full w-0.5 transition-opacity duration-[120ms] opacity-60 group-hover:opacity-100"
                style={{ backgroundColor: nodeColors[type] }}
              />
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: nodeColors[type] }} />
                <p className="text-sm font-semibold text-[var(--text)]">{definition.meta.label}</p>
              </div>
              <p className="mt-1 pl-3.5 text-xs text-[var(--text-3)]">{definition.meta.description}</p>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
