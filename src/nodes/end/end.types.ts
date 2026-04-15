export type EndResult = 'completed' | 'failed' | 'manual_review'

export interface EndConfig {
  result: EndResult
}
