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
          data-testid="json-editor-textarea"
          className="h-[70vh] w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] focus:border-[var(--accent)]"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />

        {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button data-testid="apply-json-button" onClick={onApply} variant="primary">
            Apply JSON
          </Button>
          <Button data-testid="copy-json-button" onClick={onCopy} variant="secondary">
            Copy JSON
          </Button>
          <Button data-testid="import-clipboard-json-button" onClick={onImportClipboard} variant="secondary">
            Import From Clipboard
          </Button>
        </div>
      </div>
    </Panel>
  )
}
