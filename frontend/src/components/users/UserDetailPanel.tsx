import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Mail, Calendar, CheckCircle2, XCircle, Package, FileText,
  Users, Shield, Crown, UserCog, Edit2, UserX, TrendingUp,
  Lock, Activity
} from 'lucide-react'
import type { RoleName, UserResponse } from '@/types'
import { getInitials, formatDate } from '@/utils'

// ─── Role metadata ───────────────────────────────────────────────────────────

interface RoleConfig {
  label: string
  description: string
  tagline: string
  icon: typeof Shield
  headerBg: string
  solidIconBg: string
  badgeBg: string
  badgeText: string
  ringColor: string
  accessLevel: number
  permissions: Array<{ label: string; icon: typeof Package; granted: boolean }>
}

const ROLE_CONFIG: Record<RoleName, RoleConfig> = {
  ROLE_ADMIN: {
    label: 'Admin',
    description: 'Standard administrator with full shipment management capabilities.',
    tagline: 'Manages daily logistics operations',
    icon: UserCog,
    headerBg: 'bg-slate-700',
    solidIconBg: 'bg-slate-600',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    ringColor: 'ring-slate-200',
    accessLevel: 1,
    permissions: [
      { label: 'View & Create Shipments',  icon: Package,    granted: true  },
      { label: 'Update Delivery Dates',    icon: Calendar,   granted: true  },
      { label: 'Dashboard Overview',       icon: Activity,   granted: true  },
      { label: 'Invoice Management',       icon: FileText,   granted: false },
      { label: 'Financial Data Access',    icon: TrendingUp, granted: false },
      { label: 'User Management',          icon: Users,      granted: false },
    ],
  },
  ROLE_SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Elevated administrator with financial access and invoice management.',
    tagline: 'Oversees finance & operations',
    icon: Shield,
    headerBg: 'bg-blue-700',
    solidIconBg: 'bg-blue-600',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    ringColor: 'ring-blue-200',
    accessLevel: 2,
    permissions: [
      { label: 'View & Create Shipments',  icon: Package,    granted: true  },
      { label: 'Update Delivery Dates',    icon: Calendar,   granted: true  },
      { label: 'Dashboard Overview',       icon: Activity,   granted: true  },
      { label: 'Invoice Management',       icon: FileText,   granted: true  },
      { label: 'Financial Data Access',    icon: TrendingUp, granted: true  },
      { label: 'User Management',          icon: Users,      granted: false },
    ],
  },
  ROLE_CEO_ADMIN: {
    label: 'CEO Admin',
    description: 'Full system access including user management and all financial data.',
    tagline: 'Complete system authority',
    icon: Crown,
    headerBg: 'bg-violet-700',
    solidIconBg: 'bg-violet-600',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    ringColor: 'ring-violet-200',
    accessLevel: 3,
    permissions: [
      { label: 'View & Create Shipments',  icon: Package,    granted: true  },
      { label: 'Update Delivery Dates',    icon: Calendar,   granted: true  },
      { label: 'Dashboard Overview',       icon: Activity,   granted: true  },
      { label: 'Invoice Management',       icon: FileText,   granted: true  },
      { label: 'Financial Data Access',    icon: TrendingUp, granted: true  },
      { label: 'User Management',          icon: Users,      granted: true  },
    ],
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserDetailPanelProps {
  user: UserResponse | null
  onClose: () => void
  onEdit: (user: UserResponse) => void
  onChangeRole: (user: UserResponse) => void
  onDeactivate: (user: UserResponse) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserDetailPanel({
  user, onClose, onEdit, onChangeRole, onDeactivate,
}: UserDetailPanelProps) {
  useEffect(() => {
    document.body.style.overflow = user ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [user])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  if (!user) return null

  const primaryRole = user.roles[0] ?? 'ROLE_ADMIN'
  const cfg = ROLE_CONFIG[primaryRole]
  const RoleIcon = cfg.icon
  const grantedCount = cfg.permissions.filter(p => p.granted).length

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
        style={{ animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* ── Header banner ── */}
        <div className={`${cfg.headerBg} px-6 pt-6 pb-10 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">User Profile</span>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-xl font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight truncate">{user.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail size={12} className="text-white/50" />
                <p className="text-white/70 text-sm truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white`}>
                  <RoleIcon size={11} />
                  {cfg.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                  ${user.isActive ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/50'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-white/40'}`} />
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto -mt-6">
          {/* Role card (floats over the gradient) */}
          <div className="px-5">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${cfg.solidIconBg} flex items-center justify-center`}>
                    <RoleIcon size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{cfg.label}</p>
                    <p className="text-xs text-gray-400">{cfg.tagline}</p>
                  </div>
                </div>
                {/* Access level dots */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(level => (
                    <div
                      key={level}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        level <= cfg.accessLevel
                          ? level === 1 ? 'bg-slate-400'
                          : level === 2 ? 'bg-blue-500'
                          : 'bg-violet-500'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 font-semibold ml-1">L{cfg.accessLevel}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{cfg.description}</p>
            </div>
          </div>

          {/* Info row */}
          <div className="px-5 mt-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/60">
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">Member Since</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{formatDate(user.createdAt)}</p>
            </div>
            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/60">
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">Permissions</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{grantedCount} / {cfg.permissions.length}</p>
            </div>
          </div>

          {/* Permissions */}
          <div className="px-5 mt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Access Permissions</p>
            <div className="space-y-2">
              {cfg.permissions.map(perm => {
                const PermIcon = perm.icon
                return (
                  <div
                    key={perm.label}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      perm.granted
                        ? 'bg-white border-blue-100 hover:border-blue-200'
                        : 'bg-gray-50/60 border-gray-100'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      perm.granted ? 'bg-blue-50' : 'bg-gray-100'
                    }`}>
                      <PermIcon size={13} className={perm.granted ? 'text-blue-600' : 'text-gray-400'} />
                    </div>
                    <span className={`text-sm font-medium flex-1 ${perm.granted ? 'text-gray-800' : 'text-gray-400'}`}>
                      {perm.label}
                    </span>
                    {perm.granted
                      ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      : <XCircle size={16} className="text-gray-300 flex-shrink-0" />
                    }
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 mt-5 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Actions</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onEdit(user); onClose() }}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Edit2 size={13} className="text-blue-600" />
                </div>
                Edit Profile
              </button>
              <button
                onClick={() => { onChangeRole(user); onClose() }}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Shield size={13} className="text-gray-500" />
                </div>
                Change Role
              </button>
              {user.isActive && (
                <button
                  onClick={() => { onDeactivate(user); onClose() }}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-red-100 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                    <UserX size={13} className="text-red-500" />
                  </div>
                  Deactivate Account
                </button>
              )}
              {!user.isActive && (
                <div className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl cursor-not-allowed">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Lock size={13} className="text-gray-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-400">Account Deactivated</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
