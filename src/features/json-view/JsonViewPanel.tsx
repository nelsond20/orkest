import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'

interface JsonViewPanelProps {
  value: string
  error?: string
  onChange: (value: string) => void
  onApply: () => void
  onCopy: () => Promise<void>
  onImportClipboard: () => Promise<void>
}

export function JsonViewPanel({ value, error, onChange, onApply, onCopy, onImportClipboard }: JsonViewPanelProps) {
  return (
    <Panel className="h-full" title="Workflow JSON">
      <div className="flex h-full flex-col gap-3">
        <textarea
          className="h-[70vh] w-full rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-blue-500"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />

        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={onApply} variant="primary">
            Apply JSON
          </Button>
          <Button onClick={onCopy}>Copy JSON</Button>
          <Button onClick={onImportClipboard}>Import From Clipboard</Button>
        </div>
      </div>
    </Panel>
  )
}
