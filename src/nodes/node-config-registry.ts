import type { NodeType } from '../engine/workflow.types'
import type { ZodTypeAny } from 'zod'
import { actionConfigSchema, defaultActionConfig } from './action/action.config'
import { branchConfigSchema, defaultBranchConfig } from './branch/branch.config'
import { conditionConfigSchema, defaultConditionConfig } from './condition/condition.config'
import { defaultDelayConfig, delayConfigSchema } from './delay/delay.config'
import { defaultEndConfig, endConfigSchema } from './end/end.config'
import { defaultRetryConfig, retryConfigSchema } from './retry/retry.config'
import { defaultTriggerConfig, triggerConfigSchema } from './trigger/trigger.config'

export interface NodeConfigDefinition {
  type: NodeType
  configSchema: ZodTypeAny
  defaultConfig: unknown
}

export const nodeConfigDefinitions: Record<NodeType, NodeConfigDefinition> = {
  trigger: {
    type: 'trigger',
    configSchema: triggerConfigSchema,
    defaultConfig: defaultTriggerConfig
  },
  condition: {
    type: 'condition',
    configSchema: conditionConfigSchema,
    defaultConfig: defaultConditionConfig
  },
  action: {
    type: 'action',
    configSchema: actionConfigSchema,
    defaultConfig: defaultActionConfig
  },
  delay: {
    type: 'delay',
    configSchema: delayConfigSchema,
    defaultConfig: defaultDelayConfig
  },
  branch: {
    type: 'branch',
    configSchema: branchConfigSchema,
    defaultConfig: defaultBranchConfig
  },
  retry: {
    type: 'retry',
    configSchema: retryConfigSchema,
    defaultConfig: defaultRetryConfig
  },
  end: {
    type: 'end',
    configSchema: endConfigSchema,
    defaultConfig: defaultEndConfig
  }
}

export function getNodeConfigDefinition(type: NodeType): NodeConfigDefinition {
  return nodeConfigDefinitions[type]
}
