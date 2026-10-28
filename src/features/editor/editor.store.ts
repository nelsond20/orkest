import { create } from 'zustand'
import { validateWorkflow } from '../../engine/validator/validator'
import type { ValidationResult } from '../../engine/validator/validator.types'
import type { NodeType, WorkflowDef, WorkflowEdge, WorkflowNode } from '../../engine/workflow.types'
import { persistence } from '../../lib/persistence/persistence'
import { getNodeConfigDefinition } from '../../nodes/node-config-registry'
import { workflowTemplates } from '../../templates'

interface JsonSyncState {
  draft: string
  error?: string
}

interface EditorState {
  workflow?: WorkflowDef
  selectedNodeId?: string
  dirty: boolean
  validation?: ValidationResult
  jsonSync: JsonSyncState
  loadWorkflow: (id: string) => void
  createWorkflow: (name: string) => WorkflowDef
  createFromTemplate: (templateId: string) => WorkflowDef
  updateWorkflowName: (name: string) => void
  setSelectedNode: (nodeId?: string) => void
  addNode: (type: NodeType, position: { x: number; y: number }) => WorkflowNode | undefined
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void
  setNodes: (nodes: WorkflowNode[]) => void
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void
  deleteNode: (nodeId: string) => void
  setEdges: (edges: WorkflowEdge[]) => void
  saveWorkflow: () => void
  validate: () => ValidationResult | undefined
  exportJson: () => string
  setJsonDraft: (draft: string) => void
  importJson: (jsonText: string, options?: { workflowNameOverride?: string }) => boolean
}

function nowIso(): string {
  return new Date().toISOString()
}

function createWorkflowId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? `workflow-${crypto.randomUUID()}`
    : `workflow-${Date.now()}`
}

function createNodeId(type: NodeType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function cloneWorkflow(workflow: WorkflowDef): WorkflowDef {
  return structuredClone(workflow)
}

function touchWorkflow(workflow: WorkflowDef): WorkflowDef {
  return {
    ...workflow,
    updatedAt: nowIso()
  }
}

function parseWorkflowJson(jsonText: string): WorkflowDef {
  const parsed = JSON.parse(jsonText) as WorkflowDef
  return parsed
}

export const useEditorStore = create<EditorState>((set, get) => ({
  workflow: undefined,
  selectedNodeId: undefined,
  dirty: false,
  validation: undefined,
  jsonSync: {
    draft: ''
  },

  loadWorkflow(id) {
    const workflow = persistence.getWorkflowById(id)

    if (!workflow) {
      set({ workflow: undefined, selectedNodeId: undefined, dirty: false, validation: undefined })
      return
    }

    const jsonDraft = JSON.stringify(workflow, null, 2)
    set({ workflow, selectedNodeId: undefined, dirty: false, validation: undefined, jsonSync: { draft: jsonDraft } })
  },

  createWorkflow(name) {
    const timestamp = nowIso()
    const workflow: WorkflowDef = {
      id: createWorkflowId(),
      name,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      nodes: [],
      edges: []
    }

    set({ workflow, dirty: true, selectedNodeId: undefined, validation: undefined, jsonSync: { draft: JSON.stringify(workflow, null, 2) } })
    return workflow
  },

  createFromTemplate(templateId) {
    const template = workflowTemplates.find((item) => item.id === templateId)
    if (!template) {
      return get().createWorkflow('Untitled Workflow')
    }

    const workflow = cloneWorkflow(template.workflow)
    set({ workflow, dirty: true, selectedNodeId: undefined, validation: undefined, jsonSync: { draft: JSON.stringify(workflow, null, 2) } })
    return workflow
  },

  updateWorkflowName(name) {
    const workflow = get().workflow
    if (!workflow) {
      return
    }

    const updatedWorkflow = touchWorkflow({
      ...workflow,
      name
    })

    set({ workflow: updatedWorkflow, dirty: true, jsonSync: { draft: JSON.stringify(updatedWorkflow, null, 2) } })
  },

  setSelectedNode(nodeId) {
    set({ selectedNodeId: nodeId })
  },

  addNode(type, position) {
    const workflow = get().workflow
    if (!workflow) {
      return undefined
    }

    const definition = getNodeConfigDefinition(type)
    const node: WorkflowNode = {
      id: createNodeId(type),
      type,
      position,
      config: structuredClone(definition.defaultConfig) as Record<string, unknown>
    }

    const updatedWorkflow = touchWorkflow({
      ...workflow,
      nodes: [...workflow.nodes, node]
    })

    set({
      workflow: updatedWorkflow,
      selectedNodeId: node.id,
      dirty: true,
      jsonSync: { draft: JSON.stringify(updatedWorkflow, null, 2) }
    })

    return node
  },

  updateNodePosition(nodeId, position) {
    const workflow = get().workflow
    if (!workflow) {
      return
    }

    const updatedWorkflow = touchWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node))
    })

    set({ workflow: updatedWorkflow, dirty: true, jsonSync: { draft: JSON.stringify(updatedWorkflow, null, 2) } })
  },

  setNodes(nodes) {
    const workflow = get().workflow
    if (!workflow) {
      return
    }

    const updatedWorkflow = touchWorkflow({
      ...workflow,
      nodes
    })

    set({ workflow: updatedWorkflow, dirty: true, jsonSync: { draft: JSON.stringify(updatedWorkflow, null, 2) } })
  },

  updateNodeConfig(nodeId, config) {
    const workflow = get().workflow
    if (!workflow) {
      return
    }

    const updatedWorkflow = touchWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((node) => (node.id === nodeId ? { ...node, config } : node))
    })

    set({ workflow: updatedWorkflow, dirty: true, jsonSync: { draft: JSON.stringify(updatedWorkflow, null, 2) } })
  },

  deleteNode(nodeId) {
    const workflow = get().workflow
    if (!workflow) {
      return
    }

    const updatedWorkflow = touchWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter((node) => node.id !== nodeId),
      edges: workflow.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    })

    set({
      workflow: updatedWorkflow,
      selectedNodeId: get().selectedNodeId === nodeId ? undefined : get().selectedNodeId,
      dirty: true,
      jsonSync: { draft: JSON.stringify(updatedWorkflow, null, 2) }
    })
  },

  setEdges(edges) {
    const workflow = get().workflow
    if (!workflow) {
      return
    }

    const updatedWorkflow = touchWorkflow({
      ...workflow,
      edges
    })

    set({ workflow: updatedWorkflow, dirty: true, jsonSync: { draft: JSON.stringify(updatedWorkflow, null, 2) } })
  },

  saveWorkflow() {
    const workflow = get().workflow
    if (!workflow) {
      return
    }

    const saved = persistence.saveWorkflow(workflow)
    set({ workflow: saved, dirty: false, jsonSync: { draft: JSON.stringify(saved, null, 2) } })
  },

  validate() {
    const workflow = get().workflow
    if (!workflow) {
      set({ validation: undefined })
      return undefined
    }

    const result = validateWorkflow(workflow)
    set({ validation: result })
    return result
  },

  exportJson() {
    const workflow = get().workflow
    if (!workflow) {
      return '{}'
    }

    return JSON.stringify(workflow, null, 2)
  },

  setJsonDraft(draft) {
    set({
      jsonSync: {
        draft,
        error: undefined
      }
    })
  },

  importJson(jsonText, options) {
    const workflow = get().workflow
    if (!workflow) {
      return false
    }

    try {
      const parsedWorkflow = parseWorkflowJson(jsonText)
      const nextWorkflow: WorkflowDef = options?.workflowNameOverride
        ? {
            ...parsedWorkflow,
            name: options.workflowNameOverride
          }
        : parsedWorkflow
      const result = validateWorkflow(nextWorkflow)

      if (!result.isValid) {
        set({
          validation: result,
          jsonSync: {
            draft: jsonText,
            error: result.errors[0]?.message ?? 'Invalid workflow JSON.'
          }
        })
        return false
      }

      set({ workflow: nextWorkflow, dirty: true, validation: result, jsonSync: { draft: JSON.stringify(nextWorkflow, null, 2) } })
      return true
    } catch {
      set({
        jsonSync: {
          draft: jsonText,
          error: 'Invalid JSON format.'
        }
      })
      return false
    }
  }
}))
