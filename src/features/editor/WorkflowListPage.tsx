import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { validateWorkflow } from '../../engine/validator/validator'
import type { WorkflowDef } from '../../engine/workflow.types'
import { persistence } from '../../lib/persistence/persistence'
import { workflowTemplates } from '../../templates'
import { useEditorStore } from './editor.store'
import { ImportJsonModal } from './ImportJsonModal'

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importError, setImportError] = useState<string>()
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

  const nowIso = () => new Date().toISOString()

  const createWorkflowId = () => {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `workflow-${crypto.randomUUID()}`
      : `workflow-${Date.now()}`
  }

  const getBaseNameFromFile = (fileName: string): string => {
    const withoutExtension = fileName.replace(/\.[^/.]+$/, '')
    return withoutExtension.trim() || 'Imported Workflow'
  }

  const buildImportedWorkflow = (
    jsonText: string,
    options?: { workflowNameOverride?: string }
  ): { workflow?: WorkflowDef; error?: string } => {
    try {
      const parsed = JSON.parse(jsonText) as WorkflowDef
      const name = options?.workflowNameOverride ?? parsed.name ?? 'Imported Workflow'
      const timestamp = nowIso()

      const importedWorkflow: WorkflowDef = {
        ...parsed,
        id: createWorkflowId(),
        name,
        createdAt: timestamp,
        updatedAt: timestamp
      }

      const validation = validateWorkflow(importedWorkflow)
      if (!validation.isValid) {
        return {
          error: validation.errors[0]?.message ?? 'Imported workflow is invalid.'
        }
      }

      return { workflow: importedWorkflow }
    } catch {
      return {
        error: 'Invalid JSON format.'
      }
    }
  }

  const importWorkflowFromText = (jsonText: string): boolean => {
    const result = buildImportedWorkflow(jsonText)
    if (!result.workflow) {
      setImportError(result.error ?? 'Unable to import workflow.')
      return false
    }

    const savedWorkflow = persistence.saveWorkflow(result.workflow)
    setImportError(undefined)
    reload()
    navigate(`/editor/${savedWorkflow.id}`)
    return true
  }

  const importWorkflowFromFile = async (file: File): Promise<boolean> => {
    const fileText = await file.text()
    const result = buildImportedWorkflow(fileText, {
      workflowNameOverride: getBaseNameFromFile(file.name)
    })

    if (!result.workflow) {
      setImportError(result.error ?? 'Unable to import workflow.')
      return false
    }

    const savedWorkflow = persistence.saveWorkflow(result.workflow)
    setImportError(undefined)
    reload()
    navigate(`/editor/${savedWorkflow.id}`)
    return true
  }

  const deleteWorkflow = (workflow: WorkflowDef) => {
    const confirmed = window.confirm(`Delete workflow "${workflow.name}"?`)

    if (!confirmed) {
      return
    }

    persistence.deleteWorkflow(workflow.id)
    reload()
  }

  return (
    <div className="space-y-4">
      <Panel className="p-1">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Workflows</h1>
          <div className="flex items-center gap-2">
            <Button data-testid="create-workflow-button" onClick={createNewWorkflow} variant="primary">
              New Workflow
            </Button>
            <Button data-testid="template-picker-button" onClick={() => setShowTemplatePicker((current) => !current)}>
              From Template
            </Button>
            <Button
              data-testid="workflow-import-button"
              onClick={() => {
                setImportError(undefined)
                setIsImportModalOpen(true)
              }}
            >
              Import JSON
            </Button>
          </div>
        </div>
      </Panel>

      {showTemplatePicker ? (
        <Panel title="Templates">
          <div className="grid gap-2 md:grid-cols-3">
            {workflowTemplates.map((template) => (
              <button
                data-testid={`template-option-${template.id}`}
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
            <div
              data-testid={`workflow-card-${workflow.id}`}
              key={workflow.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-left"
            >
              <p className="text-sm font-semibold text-slate-100">{workflow.name}</p>
              <p className="mt-2 text-xs text-slate-400">Updated: {new Date(workflow.updatedAt).toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">
                {workflow.nodes.length} nodes · {workflow.edges.length} edges
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  data-testid={`workflow-open-button-${workflow.id}`}
                  onClick={() => navigate(`/editor/${workflow.id}`)}
                  variant="primary"
                >
                  Open
                </Button>
                <Button
                  data-testid={`workflow-delete-button-${workflow.id}`}
                  className="bg-red-700 text-white hover:bg-red-600"
                  onClick={() => deleteWorkflow(workflow)}
                  variant="secondary"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImportJsonModal
        error={importError}
        isOpen={isImportModalOpen}
        onClose={() => {
          setImportError(undefined)
          setIsImportModalOpen(false)
        }}
        onImportFile={importWorkflowFromFile}
        onImportText={importWorkflowFromText}
      />
    </div>
  )
}
