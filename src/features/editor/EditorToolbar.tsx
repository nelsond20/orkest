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
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-3">
      <input
        data-testid="workflow-name-input"
        className="min-w-[240px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
        onChange={(event) => onWorkflowNameChange(event.target.value)}
        placeholder="Workflow name"
        value={workflowName}
      />
      <Button data-testid="tab-canvas-button" onClick={() => onTabChange('canvas')} variant={activeTab === 'canvas' ? 'primary' : 'ghost'}>
        Canvas
      </Button>
      <Button data-testid="tab-json-button" onClick={() => onTabChange('json')} variant={activeTab === 'json' ? 'primary' : 'ghost'}>
        JSON
      </Button>
      <Button data-testid="validate-workflow-button" onClick={onValidate}>
        Validate
      </Button>
      <Button data-testid="save-workflow-button" onClick={onSave}>
        Save
      </Button>
      <Button data-testid="run-workflow-button" onClick={onRun} variant="primary">
        Run
      </Button>
      <Button data-testid="export-json-button" onClick={onExportJson}>
        Export JSON
      </Button>
      <Button data-testid="import-json-button" onClick={onImportJson}>
        Import JSON
      </Button>
      <Button data-testid="fit-view-button" onClick={onFitView}>
        Fit View
      </Button>
    </div>
  )
}
