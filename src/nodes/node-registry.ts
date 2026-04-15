import type { ComponentType } from 'react'
import type { NodeType } from '../engine/workflow.types'
import type { ZodTypeAny } from 'zod'
import type { NodeDefinitionMeta } from './shared/node-ui.types'
import { TriggerNode } from './trigger/TriggerNode'
import { defaultTriggerConfig, triggerConfigSchema } from './trigger/trigger.config'
import { ConditionNode } from './condition/ConditionNode'
import { defaultConditionConfig, conditionConfigSchema } from './condition/condition.config'
import { ActionNode } from './action/ActionNode'
import { actionConfigSchema, defaultActionConfig } from './action/action.config'
import { DelayNode } from './delay/DelayNode'
import { defaultDelayConfig, delayConfigSchema } from './delay/delay.config'
import { BranchNode } from './branch/BranchNode'
import { branchConfigSchema, defaultBranchConfig } from './branch/branch.config'
import { RetryNode } from './retry/RetryNode'
import { defaultRetryConfig, retryConfigSchema } from './retry/retry.config'
import { EndNode } from './end/EndNode'
import { defaultEndConfig, endConfigSchema } from './end/end.config'

export interface NodeDefinition {
  type: NodeType
  component: ComponentType<any>
  configSchema: ZodTypeAny
  defaultConfig: unknown
  meta: NodeDefinitionMeta
}

export const nodeDefinitions: Record<NodeType, NodeDefinition> = {
  trigger: {
    type: 'trigger',
    component: TriggerNode,
    configSchema: triggerConfigSchema,
    defaultConfig: defaultTriggerConfig,
    meta: {
      label: 'Trigger',
      description: 'Start workflow from mock event input.',
      accentClassName: 'bg-blue-500'
    }
  },
  condition: {
    type: 'condition',
    component: ConditionNode,
    configSchema: conditionConfigSchema,
    defaultConfig: defaultConditionConfig,
    meta: {
      label: 'Condition',
      description: 'Route execution using true and false handles.',
      accentClassName: 'bg-amber-500'
    }
  },
  action: {
    type: 'action',
    component: ActionNode,
    configSchema: actionConfigSchema,
    defaultConfig: defaultActionConfig,
    meta: {
      label: 'Action',
      description: 'Apply deterministic action output.',
      accentClassName: 'bg-green-500'
    }
  },
  delay: {
    type: 'delay',
    component: DelayNode,
    configSchema: delayConfigSchema,
    defaultConfig: defaultDelayConfig,
    meta: {
      label: 'Delay',
      description: 'Pause execution with deterministic timer.',
      accentClassName: 'bg-violet-500'
    }
  },
  branch: {
    type: 'branch',
    component: BranchNode,
    configSchema: branchConfigSchema,
    defaultConfig: defaultBranchConfig,
    meta: {
      label: 'Branch',
      description: 'Explicit path selection with fixed handles.',
      accentClassName: 'bg-fuchsia-500'
    }
  },
  retry: {
    type: 'retry',
    component: RetryNode,
    configSchema: retryConfigSchema,
    defaultConfig: defaultRetryConfig,
    meta: {
      label: 'Retry',
      description: 'Failure-path retry policy for action node.',
      accentClassName: 'bg-orange-500'
    }
  },
  end: {
    type: 'end',
    component: EndNode,
    configSchema: endConfigSchema,
    defaultConfig: defaultEndConfig,
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
