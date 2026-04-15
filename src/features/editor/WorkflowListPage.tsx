import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import type { WorkflowDef } from '../../engine/workflow.types'
import { persistence } from '../../lib/persistence/persistence'
import { workflowTemplates } from '../../templates'
import { useEditorStore } from './editor.store'

function useWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowDef[]>([])

  const reload = () => {
    setWorkflows(persistence.listWorkflows())
  }

  useEffect(() => {
    reload()
  }, [])

  return {
    workflows,
    reload
  }
}

export function WorkflowListPage() {
  const navigate = useNavigate()
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const { createWorkflow, createFromTemplate, saveWorkflow } = useEditorStore()
  const { workflows, reload } = useWorkflows()

  const emptyState = useMemo(() => workflows.length === 0, [workflows.length])

  const createNewWorkflow = () => {
    const created = createWorkflow('Untitled Workflow')
    saveWorkflow()
    reload()
    navigate(`/editor/${created.id}`)
  }

  const createWithTemplate = (templateId: string) => {
    const created = createFromTemplate(templateId)
    saveWorkflow()
    setShowTemplatePicker(false)
    reload()
    navigate(`/editor/${created.id}`)
  }

  return (
    <div className="space-y-4">
      <Panel className="p-1">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Workflows</h1>
          <div className="flex items-center gap-2">
            <Button onClick={createNewWorkflow} variant="primary">
              New Workflow
            </Button>
            <Button onClick={() => setShowTemplatePicker((current) => !current)}>From Template</Button>
          </div>
        </div>
      </Panel>

      {showTemplatePicker ? (
        <Panel title="Templates">
          <div className="grid gap-2 md:grid-cols-3">
            {workflowTemplates.map((template) => (
              <button
                key={template.id}
                className="rounded-md border border-slate-800 bg-slate-950 px-3 py-3 text-left hover:border-slate-600"
                onClick={() => createWithTemplate(template.id)}
                type="button"
              >
                <p className="text-sm font-semibold text-slate-100">{template.name}</p>
                <p className="mt-1 text-xs text-slate-400">Initialize with deterministic node ids and edges.</p>
              </button>
            ))}
          </div>
        </Panel>
      ) : null}

      {emptyState ? (
        <Panel>
          <p className="text-sm text-slate-400">No workflows yet. Create one from scratch or start from a template.</p>
        </Panel>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map((workflow) => (
            <button
              key={workflow.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-left hover:border-slate-600"
              onClick={() => navigate(`/editor/${workflow.id}`)}
              type="button"
            >
              <p className="text-sm font-semibold text-slate-100">{workflow.name}</p>
              <p className="mt-2 text-xs text-slate-400">Updated: {new Date(workflow.updatedAt).toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">
                {workflow.nodes.length} nodes · {workflow.edges.length} edges
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
