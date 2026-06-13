import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import type { ToastType } from '@/context/ToastContext'

const configs: Record<ToastType, { icon: typeof CheckCircle; bg: string; text: string }> = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-800' },
  error:   { icon: XCircle,     bg: 'bg-red-50 border-red-200',     text: 'text-red-800'   },
  info:    { icon: Info,        bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-800'  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const cfg = configs[toast.type]
        const Icon = cfg.icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium min-w-72 max-w-sm ${cfg.bg} ${cfg.text}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
