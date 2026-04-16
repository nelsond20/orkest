import type { WorkflowDef } from '../../engine/workflow.types'
import type { ExecutionRun } from '../../features/history/history.types'
import {
  executionRunSchema,
  runCollectionSchema,
  storageKeys,
  workflowCollectionSchema,
  workflowSchema,
  type PersistenceApi
} from './persistence.types'

function parseJson(rawValue: string | null): unknown {
  if (!rawValue) {
    return []
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return []
  }
}

function loadWorkflows(): WorkflowDef[] {
  const parsed = parseJson(localStorage.getItem(storageKeys.workflows))
  const validated = workflowCollectionSchema.safeParse(parsed)

  if (!validated.success) {
    localStorage.removeItem(storageKeys.workflows)
    return []
  }

  return validated.data
}

function loadRuns(): ExecutionRun[] {
  const parsed = parseJson(localStorage.getItem(storageKeys.runs))
  const validated = runCollectionSchema.safeParse(parsed)

  if (!validated.success) {
    localStorage.removeItem(storageKeys.runs)
    return []
  }

  return validated.data
}

function saveWorkflows(workflows: WorkflowDef[]) {
  localStorage.setItem(storageKeys.workflows, JSON.stringify(workflows))
}

function saveRuns(runs: ExecutionRun[]) {
  localStorage.setItem(storageKeys.runs, JSON.stringify(runs))
}

function normalizeWorkflowName(name: string): string {
  const trimmed = name.trim()
  if (trimmed.length > 0) {
    return trimmed
  }

  return 'Untitled Workflow'
}

function ensureUniqueWorkflowName(name: string, workflowId: string, existingWorkflows: WorkflowDef[]): string {
  const normalized = normalizeWorkflowName(name)
  const occupiedNames = new Set(
    existingWorkflows
      .filter((workflow) => workflow.id !== workflowId)
      .map((workflow) => workflow.name)
  )

  if (!occupiedNames.has(normalized)) {
    return normalized
  }

  let suffix = 1
  let candidate = `${normalized} (${suffix})`

  while (occupiedNames.has(candidate)) {
    suffix += 1
    candidate = `${normalized} (${suffix})`
  }

  return candidate
}

export const persistence: PersistenceApi = {
  listWorkflows() {
    return loadWorkflows().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  },

  getWorkflowById(id: string) {
    return loadWorkflows().find((workflow) => workflow.id === id)
  },

  saveWorkflow(workflow) {
    const validatedWorkflow = workflowSchema.parse(workflow)
    const workflows = loadWorkflows()
    const nextWorkflow: WorkflowDef = {
      ...validatedWorkflow,
      name: ensureUniqueWorkflowName(validatedWorkflow.name, validatedWorkflow.id, workflows)
    }
    const index = workflows.findIndex((item) => item.id === nextWorkflow.id)

    if (index === -1) {
      workflows.push(nextWorkflow)
    } else {
      workflows[index] = nextWorkflow
    }

    saveWorkflows(workflows)
    return nextWorkflow
  },

  deleteWorkflow(id) {
    const workflows = loadWorkflows().filter((workflow) => workflow.id !== id)
    saveWorkflows(workflows)
  },

  listRuns() {
    return loadRuns().sort((left, right) => right.startedAt.localeCompare(left.startedAt))
  },

  saveRun(run) {
    const validatedRun = executionRunSchema.parse(run)
    const runs = loadRuns()
    const index = runs.findIndex((item) => item.id === validatedRun.id)

    if (index === -1) {
      runs.push(validatedRun)
    } else {
      runs[index] = validatedRun
    }

    saveRuns(runs)
    return validatedRun
  }
}
