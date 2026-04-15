import { useParams } from 'react-router-dom'

export function SimulatorPlaceholderPage() {
  const { workflowId } = useParams<{ workflowId: string }>()

  return <div className="text-sm text-app-muted">Simulator placeholder for workflow: {workflowId}</div>
}
