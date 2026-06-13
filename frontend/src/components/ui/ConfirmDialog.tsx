import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen:         boolean
  title:          string
  message:        string
  confirmLabel?:  string
  isDestructive?: boolean
  isLoading?:     boolean
  onConfirm:      () => void
  onCancel:       () => void
}

export default function ConfirmDialog({
  isOpen, title, message, confirmLabel = 'Confirm', isDestructive, isLoading, onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="p-6 flex flex-col gap-5">
        {isDestructive && (
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-600" />
          </div>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant={isDestructive ? 'danger' : 'primary'} size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
