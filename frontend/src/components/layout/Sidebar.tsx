import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, Users, LogOut, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { canAccessFinance, canManageUsers, getInitials, getRoleLabel } from '@/utils'

interface NavItem {
  path: string
  label: string
  icon: typeof LayoutDashboard
  financeOnly?: boolean
  ceoOnly?: boolean
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/shipments', label: 'Shipments', icon: Package },
  { path: '/invoices', label: 'Invoices', icon: FileText, financeOnly: true },
  { path: '/users', label: 'Users', icon: Users, ceoOnly: true },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  if (!user) return null

  const primaryRole = user.roles[0]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-navy flex flex-col z-50
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-30
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Falcons</p>
              <p className="text-gray-400 text-xs">Logistics</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            if (item.financeOnly && !canAccessFinance(user.roles)) return null
            if (item.ceoOnly && !canManageUsers(user.roles)) return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-3 py-4 border-t border-navy-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">{getInitials(user.name)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{primaryRole ? getRoleLabel(primaryRole) : ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-navy-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
