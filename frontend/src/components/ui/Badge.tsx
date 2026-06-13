import type { ShipmentStatus } from '@/types'
import { getStatusConfig } from '@/utils'

interface StatusBadgeProps {
  status: ShipmentStatus
}

interface RoleBadgeProps {
  label: string
  className?: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function RoleBadge({ label, className = 'bg-blue-100 text-blue-800' }: RoleBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
