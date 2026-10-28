export type ConditionOperator = '>' | '<' | '==' | 'in'

export type ConditionValue = string | number | boolean | string[]

export interface ConditionConfig {
  field: string
  operator: ConditionOperator
  value: ConditionValue
}
