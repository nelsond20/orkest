import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Workflow JSON" maxWidth="max-w-2xl">
      <div className="mb-4 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1">
        {(['text', 'file'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-[120ms] cursor-pointer ${
              mode === m
                ? 'bg-[var(--surface-3)] text-[var(--text)]'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
            type="button"
          >
            {m === 'text' ? 'Paste JSON' : 'From File'}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <div className="space-y-3">
          <textarea
            className="h-64 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-xs text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)]"
            onChange={(event) => { setTextValue(event.target.value); setLocalError(undefined) }}
            placeholder="Paste full workflow JSON here..."
            value={textValue}
          />
          <Button
            onClick={() => {
              const success = onImportText(textValue)
              if (!success) return
              setTextValue('')
              setLocalError(undefined)
              onClose()
            }}
            variant="primary"
          >
            Import
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <div className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-6 transition-colors duration-[120ms] hover:border-[var(--accent-border)]">
              <span className="text-xl text-[var(--text-3)]">↑</span>
              <div>
                <p className="text-xs font-medium text-[var(--text-2)]">
                  {selectedFile ? selectedFile.name : 'Choose a JSON file'}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--text-3)]">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '.json files only'}
                </p>
              </div>
            </div>
            <input
              accept=".json,application/json"
              className="sr-only"
              onChange={(event) => { setSelectedFile(event.target.files?.[0]); setLocalError(undefined) }}
              type="file"
            />
          </label>
          <Button
            disabled={!selectedFile || isImporting}
            onClick={async () => {
              if (!selectedFile) { setLocalError('Select a JSON file before importing.'); return }
              setIsImporting(true)
              setLocalError(undefined)
              const success = await onImportFile(selectedFile)
              setIsImporting(false)
              if (!success) return
              setSelectedFile(undefined)
              setLocalError(undefined)
              onClose()
            }}
            variant="primary"
          >
            {isImporting ? 'Importing...' : 'Import File'}
          </Button>
        </div>
      )}

      {mergedError ? (
        <p className="mt-3 text-xs text-[var(--destructive)]">{mergedError}</p>
      ) : null}
    </Modal>
  )
}
