export type BranchHandleId = 'branch-a' | 'branch-b'

export interface BranchOption {
  handleId: BranchHandleId
  label: string
}

export interface BranchConfig {
  options: [BranchOption, BranchOption]
}
