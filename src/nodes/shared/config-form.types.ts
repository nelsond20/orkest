export interface NodeConfigFormProps<TConfig extends object> {
  value: TConfig
  onChange: (nextConfig: TConfig) => void
}
