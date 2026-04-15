import type { ActionConfig } from '../../nodes/action/action.types'
import type { BranchConfig } from '../../nodes/branch/branch.types'
import type { ConditionConfig } from '../../nodes/condition/condition.types'
import type { DelayConfig } from '../../nodes/delay/delay.types'
import type { EndConfig } from '../../nodes/end/end.types'
import type { RetryConfig } from '../../nodes/retry/retry.types'
import type { TriggerConfig } from '../../nodes/trigger/trigger.types'
import type { ExecutionStep, StepTransition } from '../planner/planner.types'
import type { RunnerInput, RunnerState, RunnerTimer, WorkflowEvent, WorkflowRunner } from './runner.types'

interface RetryExecutionContext {
  actionStep: ExecutionStep
  retryStep: ExecutionStep
  payload: unknown
}

const defaultTimer: RunnerTimer = {
  wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}

function createRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readPayloadField(payload: unknown, fieldPath: string): unknown {
  if (!fieldPath) {
    return undefined
  }

  return fieldPath.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object' && segment in value) {
      return (value as Record<string, unknown>)[segment]
    }

    return undefined
  }, payload)
}

function evaluateCondition(config: ConditionConfig, payload: unknown): boolean {
  const leftFromCurrentPayload = readPayloadField(payload, config.field)
  const left =
    leftFromCurrentPayload ??
    readPayloadField(
      payload && typeof payload === 'object' && 'payload' in payload ? (payload as { payload: unknown }).payload : undefined,
      config.field
    )
  const right = config.value

  switch (config.operator) {
    case '>':
      return Number(left) > Number(right)
    case '<':
      return Number(left) < Number(right)
    case '==':
      return left === right
    case 'in': {
      if (Array.isArray(right)) {
        return right.includes(String(left))
      }

      if (typeof right === 'string') {
        return right.includes(String(left))
      }

      return false
    }
    default:
      return false
  }
}

function pickTransition(transitions: StepTransition[], sourceHandle: string): StepTransition | undefined {
  return transitions.find((transition) => transition.sourceHandle === sourceHandle)
}

function toDelayMs(config: DelayConfig): number {
  const base = config.unit === 'minutes' ? 60_000 : 1_000
  return config.duration * base
}

function emit(eventSink: ((event: WorkflowEvent) => void) | undefined, event: WorkflowEvent) {
  eventSink?.(event)
}

export function createWorkflowRunner(input: RunnerInput): WorkflowRunner {
  const stepMap = new Map(input.plan.steps.map((step) => [step.nodeId, step]))
  const timer = input.timer ?? defaultTimer
  const runId = createRunId()
  const visitedNodes = new Set<string>()
  const state: RunnerState = {
    runId,
    status: 'idle',
    currentNodeId: input.plan.startNodeId
  }

  let payload: unknown = input.mockInput
  let retryContext: RetryExecutionContext | undefined

  const finishRun = (result: 'success' | 'failed'): RunnerState => {
    state.status = 'completed'
    state.result = result

    for (const step of input.plan.steps) {
      if (!visitedNodes.has(step.nodeId)) {
        emit(input.onEvent, { type: 'step:skipped', nodeId: step.nodeId })
      }
    }

    emit(input.onEvent, { type: 'run:completed', status: result })
    return { ...state }
  }

  const ensureStarted = () => {
    if (state.status !== 'idle') {
      return
    }

    state.status = 'running'
    emit(input.onEvent, { type: 'run:started', runId })
  }

  const executeRetryStep = async (step: ExecutionStep): Promise<RunnerState> => {
    const config = step.config as unknown as RetryConfig

    if (!retryContext || retryContext.retryStep.nodeId !== step.nodeId) {
      emit(input.onEvent, { type: 'step:failed', nodeId: step.nodeId, error: 'Retry node has no attached failed action.' })
      return finishRun('failed')
    }

    for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
      emit(input.onEvent, { type: 'step:retried', nodeId: retryContext.actionStep.nodeId, attempt })

      if (config.delaySeconds > 0) {
        await timer.wait(config.delaySeconds * 1_000)
      }

      const successAt = (input.mockInput.retrySuccessAt as Record<string, number> | undefined)?.[
        retryContext.actionStep.nodeId
      ]

      if (successAt === attempt) {
        const recoveredOutput = {
          status: 'retried-success',
          nodeId: retryContext.actionStep.nodeId,
          attempt,
          input: retryContext.payload
        }

        emit(input.onEvent, { type: 'step:succeeded', nodeId: step.nodeId, output: recoveredOutput })

        const nextNodeId = retryContext.actionStep.retryAttachment?.onSuccessNodeId
        retryContext = undefined

        if (!nextNodeId) {
          return finishRun('success')
        }

        payload = recoveredOutput
        state.currentNodeId = nextNodeId
        return { ...state }
      }
    }

    emit(input.onEvent, { type: 'step:failed', nodeId: step.nodeId, error: 'Retry attempts exhausted.' })
    const exhaustedNodeId = retryContext.actionStep.retryAttachment?.onExhaustedNodeId
    retryContext = undefined

    if (!exhaustedNodeId) {
      return finishRun('failed')
    }

    state.currentNodeId = exhaustedNodeId
    return { ...state }
  }

  const step = async (): Promise<RunnerState> => {
    ensureStarted()

    if (state.status === 'completed') {
      return { ...state }
    }

    const currentNodeId = state.currentNodeId
    if (!currentNodeId) {
      return finishRun('success')
    }

    const currentStep = stepMap.get(currentNodeId)
    if (!currentStep) {
      return finishRun('failed')
    }

    visitedNodes.add(currentStep.nodeId)
    emit(input.onEvent, { type: 'step:started', nodeId: currentStep.nodeId })

    switch (currentStep.nodeType) {
      case 'trigger': {
        const config = currentStep.config as unknown as TriggerConfig
        const output = {
          eventType: config.eventType,
          payload: input.mockInput
        }
        payload = output
        emit(input.onEvent, { type: 'step:succeeded', nodeId: currentStep.nodeId, output })
        state.currentNodeId = currentStep.transitions[0]?.targetNodeId
        return { ...state }
      }

      case 'condition': {
        const config = currentStep.config as unknown as ConditionConfig
        const conditionResult = evaluateCondition(config, payload)
        const handle = conditionResult ? 'true' : 'false'
        const nextTransition = pickTransition(currentStep.transitions, handle)

        if (!nextTransition) {
          emit(input.onEvent, {
            type: 'step:failed',
            nodeId: currentStep.nodeId,
            error: `Condition branch "${handle}" is not connected.`
          })
          return finishRun('failed')
        }

        const output = {
          conditionResult,
          matchedHandle: handle,
          payload
        }

        payload = output
        emit(input.onEvent, { type: 'step:succeeded', nodeId: currentStep.nodeId, output })
        state.currentNodeId = nextTransition.targetNodeId
        return { ...state }
      }

      case 'action': {
        const config = currentStep.config as unknown as ActionConfig
        const shouldFail = Boolean(config.shouldFail)

        if (shouldFail) {
          emit(input.onEvent, {
            type: 'step:failed',
            nodeId: currentStep.nodeId,
            error: `Action ${config.actionType} failed during deterministic simulation.`
          })

          if (currentStep.retryAttachment) {
            const retryStep = stepMap.get(currentStep.retryAttachment.retryNodeId)

            if (!retryStep) {
              return finishRun('failed')
            }

            retryContext = {
              actionStep: currentStep,
              retryStep,
              payload
            }

            state.currentNodeId = retryStep.nodeId
            return { ...state }
          }

          return finishRun('failed')
        }

        const output = {
          actionType: config.actionType,
          params: config.params,
          input: payload
        }

        payload = output
        emit(input.onEvent, { type: 'step:succeeded', nodeId: currentStep.nodeId, output })

        const nextTransition = pickTransition(currentStep.transitions, 'success') ?? currentStep.transitions[0]
        state.currentNodeId = nextTransition?.targetNodeId
        return { ...state }
      }

      case 'delay': {
        const config = currentStep.config as unknown as DelayConfig
        await timer.wait(toDelayMs(config))
        const output = {
          delayMs: toDelayMs(config),
          payload
        }

        payload = output
        emit(input.onEvent, { type: 'step:succeeded', nodeId: currentStep.nodeId, output })
        state.currentNodeId = currentStep.transitions[0]?.targetNodeId
        return { ...state }
      }

      case 'branch': {
        const config = currentStep.config as unknown as BranchConfig
        const selected = (input.mockInput.selectedBranches as Record<string, string> | undefined)?.[
          currentStep.nodeId
        ]

        const fallbackHandle = config.options[0]?.handleId ?? 'branch-a'
        const selectedHandle = selected ?? fallbackHandle
        const nextTransition = pickTransition(currentStep.transitions, selectedHandle)

        if (!nextTransition) {
          emit(input.onEvent, {
            type: 'step:failed',
            nodeId: currentStep.nodeId,
            error: `Branch handle "${selectedHandle}" is not connected.`
          })
          return finishRun('failed')
        }

        const output = {
          selectedHandle,
          payload
        }

        payload = output
        emit(input.onEvent, { type: 'step:succeeded', nodeId: currentStep.nodeId, output })
        state.currentNodeId = nextTransition.targetNodeId
        return { ...state }
      }

      case 'retry': {
        return executeRetryStep(currentStep)
      }

      case 'end': {
        const config = currentStep.config as unknown as EndConfig
        emit(input.onEvent, {
          type: 'step:succeeded',
          nodeId: currentStep.nodeId,
          output: {
            result: config.result
          }
        })

        if (config.result === 'failed') {
          return finishRun('failed')
        }

        return finishRun('success')
      }

      default:
        return finishRun('failed')
    }
  }

  return {
    async step() {
      return step()
    },

    async runAuto() {
      while (state.status !== 'completed') {
        await step()

        if (state.status === 'running' && (input.autoStepDelayMs ?? 0) > 0) {
          await timer.wait(input.autoStepDelayMs ?? 0)
        }
      }

      return { ...state }
    },

    getState() {
      return { ...state }
    }
  }
}
