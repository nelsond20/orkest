import { useParams, useSearchParams } from 'react-router-dom'

export function EditorPlaceholderPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  return (
    <div className="space-y-2 text-sm text-app-muted">
      <p>Editor placeholder for workflow: {id}</p>
      <p>Tab: {searchParams.get('tab') ?? 'canvas'}</p>
    </div>
  )
}
