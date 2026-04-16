import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'

type ImportMode = 'text' | 'file'

interface ImportJsonModalProps {
  isOpen: boolean
  error?: string
  onClose: () => void
  onImportText: (text: string) => boolean
  onImportFile: (file: File) => Promise<boolean>
}

export function ImportJsonModal({ isOpen, error, onClose, onImportText, onImportFile }: ImportJsonModalProps) {
  const [mode, setMode] = useState<ImportMode>('text')
  const [textValue, setTextValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File>()
  const [localError, setLocalError] = useState<string>()
  const [isImporting, setIsImporting] = useState(false)

  const mergedError = useMemo(() => localError ?? error, [localError, error])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Import Workflow JSON</h2>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>

        <div className="mb-3 flex gap-2">
          <Button onClick={() => setMode('text')} variant={mode === 'text' ? 'primary' : 'secondary'}>
            Import From Text
          </Button>
          <Button onClick={() => setMode('file')} variant={mode === 'file' ? 'primary' : 'secondary'}>
            Import From Device
          </Button>
        </div>

        {mode === 'text' ? (
          <div className="space-y-3">
            <textarea
              className="h-72 w-full rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-blue-500"
              onChange={(event) => {
                setTextValue(event.target.value)
                setLocalError(undefined)
              }}
              placeholder="Paste full workflow JSON here"
              value={textValue}
            />
            <Button
              onClick={() => {
                const success = onImportText(textValue)
                if (!success) {
                  return
                }

                setTextValue('')
                setLocalError(undefined)
                onClose()
              }}
              variant="primary"
            >
              Import Text JSON
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              accept=".json,application/json"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-xs file:text-slate-100"
              onChange={(event) => {
                const nextFile = event.target.files?.[0]
                setSelectedFile(nextFile)
                setLocalError(undefined)
              }}
              type="file"
            />
            {selectedFile ? <p className="text-xs text-slate-400">Selected file: {selectedFile.name}</p> : null}
            <Button
              disabled={!selectedFile || isImporting}
              onClick={async () => {
                if (!selectedFile) {
                  setLocalError('Select a JSON file before importing.')
                  return
                }

                setIsImporting(true)
                setLocalError(undefined)
                const success = await onImportFile(selectedFile)
                setIsImporting(false)

                if (!success) {
                  return
                }

                setSelectedFile(undefined)
                setLocalError(undefined)
                onClose()
              }}
              variant="primary"
            >
              {isImporting ? 'Importing...' : 'Import File JSON'}
            </Button>
          </div>
        )}

        {mergedError ? <p className="mt-3 text-xs text-red-400">{mergedError}</p> : null}
      </div>
    </div>
  )
}
