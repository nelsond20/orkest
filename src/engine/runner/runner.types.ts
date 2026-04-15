export interface RunStartedEvent {
  type: 'run:started'
  runId: string
}

export interface StepStartedEvent {
  type: 'step:started'
  nodeId: string
}

export interface StepSucceededEvent {
  type: 'step:succeeded'
  nodeId: string
  output: unknown
}

export interface StepFailedEvent {
  type: 'step:failed'
  nodeId: string
  error: string
}

export interface StepSkippedEvent {
  type: 'step:skipped'
  nodeId: string
}

export interface StepRetriedEvent {
  type: 'step:retried'
  nodeId: string
  attempt: number
}

export interface RunCompletedEvent {
  type: 'run:completed'
  status: 'success' | 'failed'
}

export type WorkflowEvent =
  | RunStartedEvent
  | StepStartedEvent
  | StepSucceededEvent
  | StepFailedEvent
  | StepSkippedEvent
  | StepRetriedEvent
  | RunCompletedEvent
