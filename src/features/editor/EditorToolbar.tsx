import { Button } from '../../components/ui/Button'

interface EditorToolbarProps {
  workflowName: string
  activeTab: 'canvas' | 'json'
  onTabChange: (tab: 'canvas' | 'json') => void
  onWorkflowNameChange: (value: string) => void
  onValidate: () => void
  onRun: () => void
  onSave: () => void
  onExportJson: () => void
  onImportJson: () => void
  onFitView: () => void
}

export function EditorToolbar({
  workflowName,
  activeTab,
  onTabChange,
  onWorkflowNameChange,
  onValidate,
  onRun,
  onSave,
  onExportJson,
  onImportJson,
  onFitView
}: EditorToolbarProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 mb-3 flex flex-wrap items-center gap-2">
      <input
        data-testid="workflow-name-input"
        className="min-w-[200px] flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)]"
        onChange={(event) => onWorkflowNameChange(event.target.value)}
        placeholder="Workflow name"
        value={workflowName}
      />

      <span className="h-4 w-px bg-[var(--border)]" />

      {(['canvas', 'json'] as const).map((tab) => (
        <button
          key={tab}
          data-testid={`tab-${tab}-button`}
          onClick={() => onTabChange(tab)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-all duration-[120ms] cursor-pointer ${
            activeTab === tab
              ? 'border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-bright)]'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
          type="button"
        >
          {tab === 'canvas' ? 'Canvas' : 'JSON'}
        </button>
      ))}

      <span className="h-4 w-px bg-[var(--border)]" />

      <Button data-testid="validate-workflow-button" onClick={onValidate} variant="secondary">
        Validate
      </Button>
      <Button data-testid="save-workflow-button" onClick={onSave} variant="secondary">
        Save
      </Button>
      <Button data-testid="run-workflow-button" onClick={onRun} variant="primary">
        Run
      </Button>

      <span className="h-4 w-px bg-[var(--border)]" />

      <Button data-testid="export-json-button" onClick={onExportJson} variant="ghost">
        Export JSON
      </Button>
      <Button data-testid="import-json-button" onClick={onImportJson} variant="ghost">
        Import JSON
      </Button>
      <Button data-testid="fit-view-button" onClick={onFitView} variant="ghost">
        Fit View
      </Button>
    </div>
  )
}
