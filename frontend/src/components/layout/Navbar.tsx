import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/utils'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/shipments': 'Shipments',
  '/invoices':  'Invoices',
  '/users':     'Users',
}

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const base = '/' + pathname.split('/')[1]
  const title = pageTitles[base] ?? 'Falcons Logistics'

  const now = new Date()
  const dateStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(now)

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-[17px] font-bold text-gray-900 leading-none">{title}</h1>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium hidden sm:block">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer relative"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{user.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-button cursor-pointer">
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
