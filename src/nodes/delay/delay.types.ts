export type DelayUnit = 'seconds' | 'minutes'

export interface DelayConfig {
  duration: number
  unit: DelayUnit
}
