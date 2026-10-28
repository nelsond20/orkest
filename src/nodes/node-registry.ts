import type { ComponentType } from 'react'
import type { NodeType } from '../engine/workflow.types'
import { getNodeConfigDefinition } from './node-config-registry'
import type { NodeDefinitionMeta } from './shared/node-ui.types'
import { TriggerNode } from './trigger/TriggerNode'
import { ConditionNode } from './condition/ConditionNode'
import { ActionNode } from './action/ActionNode'
import { DelayNode } from './delay/DelayNode'
import { BranchNode } from './branch/BranchNode'
import { RetryNode } from './retry/RetryNode'
import { EndNode } from './end/EndNode'

export interface NodeDefinition {
  type: NodeType
  component: ComponentType<any>
  configSchema: ReturnType<typeof getNodeConfigDefinition>['configSchema']
  defaultConfig: unknown
  meta: NodeDefinitionMeta
}

export const nodeDefinitions: Record<NodeType, NodeDefinition> = {
  trigger: {
    type: 'trigger',
    component: TriggerNode,
    configSchema: getNodeConfigDefinition('trigger').configSchema,
    defaultConfig: getNodeConfigDefinition('trigger').defaultConfig,
    meta: {
      label: 'Trigger',
      description: 'Start workflow from mock event input.',
      accentClassName: 'bg-blue-500'
    }
  },
  condition: {
    type: 'condition',
    component: ConditionNode,
    configSchema: getNodeConfigDefinition('condition').configSchema,
    defaultConfig: getNodeConfigDefinition('condition').defaultConfig,
    meta: {
      label: 'Condition',
      description: 'Route execution using true and false handles.',
      accentClassName: 'bg-amber-500'
    }
  },
  action: {
    type: 'action',
    component: ActionNode,
    configSchema: getNodeConfigDefinition('action').configSchema,
    defaultConfig: getNodeConfigDefinition('action').defaultConfig,
    meta: {
      label: 'Action',
      description: 'Apply deterministic action output.',
      accentClassName: 'bg-green-500'
    }
  },
  delay: {
    type: 'delay',
    component: DelayNode,
    configSchema: getNodeConfigDefinition('delay').configSchema,
    defaultConfig: getNodeConfigDefinition('delay').defaultConfig,
    meta: {
      label: 'Delay',
      description: 'Pause execution with deterministic timer.',
      accentClassName: 'bg-violet-500'
    }
  },
  branch: {
    type: 'branch',
    component: BranchNode,
    configSchema: getNodeConfigDefinition('branch').configSchema,
    defaultConfig: getNodeConfigDefinition('branch').defaultConfig,
    meta: {
      label: 'Branch',
      description: 'Explicit path selection with fixed handles.',
      accentClassName: 'bg-fuchsia-500'
    }
  },
  retry: {
    type: 'retry',
    component: RetryNode,
    configSchema: getNodeConfigDefinition('retry').configSchema,
    defaultConfig: getNodeConfigDefinition('retry').defaultConfig,
    meta: {
      label: 'Retry',
      description: 'Failure-path retry policy for action node.',
      accentClassName: 'bg-orange-500'
    }
  },
  end: {
    type: 'end',
    component: EndNode,
    configSchema: getNodeConfigDefinition('end').configSchema,
    defaultConfig: getNodeConfigDefinition('end').defaultConfig,
    meta: {
      label: 'End',
      description: 'Finish execution with final result status.',
      accentClassName: 'bg-slate-400'
    }
  }
}

export function getNodeDefinition(type: NodeType): NodeDefinition {
  return nodeDefinitions[type]
}
