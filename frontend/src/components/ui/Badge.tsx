import type { ShipmentStatus } from '@/types'
import { getStatusConfig } from '@/utils'

interface StatusBadgeProps {
  status: ShipmentStatus
}

interface RoleBadgeProps {
  label:     string
  className?: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      {config.label}
    </span>
  )
}

export function RoleBadge({ label, className = 'bg-blue-50 text-blue-700 border border-blue-100' }: RoleBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
