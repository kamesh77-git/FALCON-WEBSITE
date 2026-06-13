import type { RoleName, ShipmentStatus } from '@/types'

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

export const toInputDate = (date: string | null | undefined): string => {
  if (!date) return ''
  return date.split('T')[0]
}

export const isCeoAdmin = (roles: RoleName[]) => roles.includes('ROLE_CEO_ADMIN')
export const isSuperAdmin = (roles: RoleName[]) => roles.includes('ROLE_SUPER_ADMIN')
export const canAccessFinance = (roles: RoleName[]) =>
  roles.some(r => r === 'ROLE_SUPER_ADMIN' || r === 'ROLE_CEO_ADMIN')
export const canManageUsers = (roles: RoleName[]) => roles.includes('ROLE_CEO_ADMIN')

export const getRoleLabel = (role: RoleName): string => {
  const map: Record<RoleName, string> = {
    ROLE_ADMIN: 'Admin',
    ROLE_SUPER_ADMIN: 'Super Admin',
    ROLE_CEO_ADMIN: 'CEO Admin',
  }
  return map[role] ?? role
}

export const getStatusConfig = (status: ShipmentStatus) => {
  const map: Record<ShipmentStatus, { label: string; className: string }> = {
    NOT_DELIVERED: { label: 'Not Delivered', className: 'bg-amber-100 text-amber-800' },
    DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
    INVOICED: { label: 'Invoiced', className: 'bg-blue-100 text-blue-800' },
  }
  return map[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' }
}

export const getInitials = (name: string): string =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
