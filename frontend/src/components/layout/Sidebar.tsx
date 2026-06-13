import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, Users, LogOut, X, Zap } from 'lucide-react'
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
  { path: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/shipments', label: 'Shipments',  icon: Package },
  { path: '/invoices',  label: 'Invoices',   icon: FileText, financeOnly: true },
  { path: '/users',     label: 'Users',      icon: Users,    ceoOnly: true },
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50
        flex flex-col
        bg-navy shadow-sidebar
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-30
      `}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-button flex-shrink-0">
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none tracking-tight">Falcons</p>
              <p className="text-navy-600 text-[11px] mt-0.5 font-medium">Logistics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden w-8 h-8 flex items-center justify-center text-navy-600 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-navy-600 uppercase tracking-widest mb-2">Menu</p>
          {navItems.map(item => {
            if (item.financeOnly && !canAccessFinance(user.roles)) return null
            if (item.ceoOnly && !canManageUsers(user.roles)) return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                aria-label={item.label}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-button'
                      : 'text-navy-600 hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={isActive ? 'text-white' : 'text-navy-600'} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-button">
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate leading-none">{user.name}</p>
              <p className="text-navy-600 text-[11px] mt-0.5 truncate font-medium">{primaryRole ? getRoleLabel(primaryRole) : ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-600 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
