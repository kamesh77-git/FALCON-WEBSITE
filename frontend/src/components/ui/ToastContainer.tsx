import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import type { ToastType } from '@/context/ToastContext'

const configs: Record<ToastType, { icon: typeof CheckCircle2; bg: string; border: string; icon_cls: string }> = {
  success: { icon: CheckCircle2, bg: 'bg-white', border: 'border-green-200',  icon_cls: 'text-green-600' },
  error:   { icon: XCircle,      bg: 'bg-white', border: 'border-red-200',    icon_cls: 'text-red-600'   },
  info:    { icon: Info,         bg: 'bg-white', border: 'border-blue-200',   icon_cls: 'text-blue-600'  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()
  return (
    <div role="region" aria-live="polite" className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const cfg = configs[toast.type]
        const Icon = cfg.icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl border shadow-card-md text-sm font-semibold min-w-72 max-w-sm ${cfg.bg} ${cfg.border} animate-fade-in-up`}
          >
            <Icon size={18} className={`flex-shrink-0 ${cfg.icon_cls}`} />
            <span className="flex-1 text-gray-800 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
