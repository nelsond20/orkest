import { Button } from '../../components/ui/Button'

interface EditorToolbarProps {
  workflowName: string
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
        className="min-w-[240px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
        onChange={(event) => onWorkflowNameChange(event.target.value)}
        placeholder="Workflow name"
        value={workflowName}
      />
      <Button onClick={onValidate}>Validate</Button>
      <Button onClick={onSave}>Save</Button>
      <Button onClick={onRun} variant="primary">
        Run
      </Button>
      <Button onClick={onExportJson}>Export JSON</Button>
      <Button onClick={onImportJson}>Import JSON</Button>
      <Button onClick={onFitView}>Fit View</Button>
    </div>
  )
}
