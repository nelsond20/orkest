export type ActionType = 'notify' | 'updateStatus' | 'assignQueue' | 'addTag'

export interface ActionConfig {
  actionType: ActionType
  params: Record<string, unknown>
  shouldFail?: boolean
}
