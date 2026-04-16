import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} maxWidth="max-w-sm" onClose={onCancel}>
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
          {description ? (
            <p className="text-xs leading-relaxed text-[var(--text-2)]">{description}</p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} variant="ghost">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} variant={variant === 'destructive' ? 'danger' : 'primary'}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
