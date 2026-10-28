import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Panel } from '../../components/ui/Panel'
import { validateWorkflow } from '../../engine/validator/validator'
import type { WorkflowDef } from '../../engine/workflow.types'
import { persistence } from '../../lib/persistence/persistence'
import { workflowTemplates } from '../../templates'
import { useEditorStore } from './editor.store'
import { ImportJsonModal } from './ImportJsonModal'

const nodeTypeColors: Record<string, string> = {
  trigger: '#3b82f6',
  action: '#22c55e',
  condition: '#f59e0b',
  delay: '#8b5cf6',
  branch: '#d946ef',
  retry: '#f97316',
  end: '#64748b',
}

function NodeDots({ nodes }: { nodes: WorkflowDef['nodes'] }) {
  const visible = nodes.slice(0, 10)
  const extra = nodes.length - visible.length
  return (
    <div className="flex items-center gap-1">
      {visible.map((node, i) => (
        <span
          key={`${node.id}-${i}`}
          className="block h-2 w-2 rounded-full"
          style={{ backgroundColor: nodeTypeColors[node.type] ?? '#64748b' }}
          title={node.type}
        />
      ))}
      {extra > 0 ? (
        <span className="text-[11px] text-[var(--text-3)]">+{extra}</span>
      ) : null}
    </div>
  )
}

function useWorkflows() {
  const [workflows, setWorkflows] = useState<WorkflowDef[]>([])

  const reload = () => {
    setWorkflows(persistence.listWorkflows())
  }

  useEffect(() => {
    reload()
  }, [])

  return { workflows, reload }
}

export function WorkflowListPage() {
  const navigate = useNavigate()
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importError, setImportError] = useState<string>()
  const [deleteTarget, setDeleteTarget] = useState<WorkflowDef | null>(null)
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
        return { error: validation.errors[0]?.message ?? 'Imported workflow is invalid.' }
      }

      return { workflow: importedWorkflow }
    } catch {
      return { error: 'Invalid JSON format.' }
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
    setDeleteTarget(workflow)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Workflows</h1>
          <p className="mt-1 text-sm text-[var(--text-3)]">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button data-testid="create-workflow-button" onClick={createNewWorkflow} variant="primary">
            New Workflow
          </Button>
          <Button
            data-testid="template-picker-button"
            onClick={() => setShowTemplatePicker((current) => !current)}
          >
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

      {showTemplatePicker ? (
        <Panel title="Templates">
          <div className="grid gap-3 md:grid-cols-3">
            {workflowTemplates.map((template) => (
              <button
                data-testid={`template-option-${template.id}`}
                key={template.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition-all duration-[120ms] hover:border-[var(--accent-border)] hover:bg-[var(--surface-2)]"
                onClick={() => createWithTemplate(template.id)}
                type="button"
              >
                <p className="text-sm font-semibold text-[var(--text)]">{template.name}</p>
                <p className="mt-1.5 text-xs text-[var(--text-3)]">
                  Initialize with deterministic node ids and edges.
                </p>
              </button>
            ))}
          </div>
        </Panel>
      ) : null}

      {emptyState ? (
        <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <span className="text-2xl text-[var(--text-3)]">⊡</span>
          </div>
          <p className="text-base font-semibold text-[var(--text-2)]">No workflows yet</p>
          <p className="mt-2 text-sm text-[var(--text-3)]">
            Create one from scratch or start from a template.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map((workflow, index) => (
            <div
              data-testid={`workflow-card-${workflow.id}`}
              key={workflow.id}
              className={`animate-slide-up rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-[120ms] hover:border-[var(--accent-border)] hover:bg-[var(--surface-2)] stagger-${Math.min(index + 1, 5)}`}
            >
              <p className="text-base font-semibold tracking-tight text-[var(--text)]">
                {workflow.name}
              </p>

              {workflow.nodes.length > 0 ? (
                <div className="mt-3">
                  <NodeDots nodes={workflow.nodes} />
                </div>
              ) : null}

              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-3)]">
                <span>{workflow.nodes.length} nodes</span>
                <span>·</span>
                <span>{workflow.edges.length} edges</span>
                <span>·</span>
                <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  data-testid={`workflow-open-button-${workflow.id}`}
                  onClick={() => navigate(`/editor/${workflow.id}`)}
                  variant="primary"
                >
                  Open
                </Button>
                <Button
                  data-testid={`workflow-delete-button-${workflow.id}`}
                  onClick={() => deleteWorkflow(workflow)}
                  variant="danger"
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

      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Delete"
        description="This workflow will be permanently removed."
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) persistence.deleteWorkflow(deleteTarget.id)
          setDeleteTarget(null)
          reload()
        }}
        title={`Delete "${deleteTarget?.name}"?`}
        variant="destructive"
      />
    </div>
  )
}
