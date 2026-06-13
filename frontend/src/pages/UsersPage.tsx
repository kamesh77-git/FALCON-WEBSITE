import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Edit2, Shield, UserX, Users, Crown, UserCog,
  Search, ChevronRight
} from 'lucide-react'
import { getAllUsers, createUser, updateUser, updateUserRole, deactivateUser } from '@/api/users'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { getRoleLabel, getInitials, formatDate } from '@/utils'
import { useToast } from '@/context/ToastContext'
import type { RoleName, UserResponse } from '@/types'
import UserDetailPanel from '@/components/users/UserDetailPanel'

const roleOptions = [
  { value: 'ROLE_ADMIN',       label: 'Admin' },
  { value: 'ROLE_SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ROLE_CEO_ADMIN',   label: 'CEO Admin' },
]

const createSchema = z.object({
  name:     z.string().min(1, 'Name is required'),
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
  role:     z.enum(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN']),
})
const editSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
})

type CreateForm = z.infer<typeof createSchema>
type EditForm   = z.infer<typeof editSchema>

// ─── Role display helpers ─────────────────────────────────────────────────────

const ROLE_STYLES: Record<RoleName, { badge: string; icon: typeof Shield; dot: string }> = {
  ROLE_ADMIN:       { badge: 'bg-slate-100 text-slate-700 border border-slate-200', icon: UserCog, dot: 'bg-slate-400' },
  ROLE_SUPER_ADMIN: { badge: 'bg-blue-50 text-blue-700 border border-blue-100',   icon: Shield,   dot: 'bg-blue-500' },
  ROLE_CEO_ADMIN:   { badge: 'bg-violet-50 text-violet-700 border border-violet-100', icon: Crown, dot: 'bg-violet-500' },
}

// ─── Summary cards data ───────────────────────────────────────────────────────

function RoleSummaryCard({
  role, count, total
}: { role: RoleName; count: number; total: number }) {
  const s = ROLE_STYLES[role]
  const Icon = s.icon
  const label = getRoleLabel(role)
  const pct = total ? Math.round((count / total) * 100) : 0

  const solidColors: Record<RoleName, { icon: string; bar: string }> = {
    ROLE_ADMIN:       { icon: 'bg-slate-500',  bar: 'bg-slate-400'  },
    ROLE_SUPER_ADMIN: { icon: 'bg-blue-600',   bar: 'bg-blue-500'   },
    ROLE_CEO_ADMIN:   { icon: 'bg-violet-600', bar: 'bg-violet-500' },
  }
  const colors = solidColors[role]

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-card hover:shadow-card-md transition-all duration-200 p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center shadow-button`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{count}</span>
      </div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{pct}% of team</p>
      <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers]                     = useState<UserResponse[]>([])
  const [filtered, setFiltered]               = useState<UserResponse[]>([])
  const [search, setSearch]                   = useState('')
  const [isLoading, setIsLoading]             = useState(true)
  const [showCreate, setShowCreate]           = useState(false)
  const [editUser, setEditUser]               = useState<UserResponse | null>(null)
  const [roleUser, setRoleUser]               = useState<UserResponse | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<UserResponse | null>(null)
  const [selectedRole, setSelectedRole]       = useState<RoleName>('ROLE_ADMIN')
  const [isActing, setIsActing]               = useState(false)
  const [detailUser, setDetailUser]           = useState<UserResponse | null>(null)

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) })
  const editForm   = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await getAllUsers()
      const data = res.data.data
      setUsers(data)
      setFiltered(data)
    } finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      q
        ? users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.roles.some(r => getRoleLabel(r).toLowerCase().includes(q))
          )
        : users
    )
  }, [search, users])

  const handleCreate = async (data: CreateForm) => {
    try {
      await createUser(data)
      showToast('User created successfully', 'success')
      setShowCreate(false)
      createForm.reset()
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      showToast(msg ?? 'Failed to create user', 'error')
    }
  }

  const handleEdit = async (data: EditForm) => {
    if (!editUser) return
    try {
      await updateUser(editUser.id, data)
      showToast('User updated', 'success')
      setEditUser(null)
      load()
    } catch { showToast('Failed to update user', 'error') }
  }

  const handleRoleChange = async () => {
    if (!roleUser) return
    setIsActing(true)
    try {
      await updateUserRole(roleUser.id, { role: selectedRole })
      showToast('Role updated', 'success')
      setRoleUser(null)
      load()
    } catch { showToast('Failed to update role', 'error') }
    finally { setIsActing(false) }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setIsActing(true)
    try {
      await deactivateUser(deactivateTarget.id)
      showToast('User deactivated', 'success')
      setDeactivateTarget(null)
      load()
    } catch { showToast('Failed to deactivate user', 'error') }
    finally { setIsActing(false) }
  }

  const adminCount     = users.filter(u => u.roles.includes('ROLE_ADMIN') && !u.roles.includes('ROLE_SUPER_ADMIN') && !u.roles.includes('ROLE_CEO_ADMIN')).length
  const superCount     = users.filter(u => u.roles.includes('ROLE_SUPER_ADMIN')).length
  const ceoCount       = users.filter(u => u.roles.includes('ROLE_CEO_ADMIN')).length

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isLoading ? 'Loading…' : `${users.length} member${users.length !== 1 ? 's' : ''} across all roles`}
          </p>
        </div>
        <Button leftIcon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
          Add Member
        </Button>
      </div>

      {/* ── Role summary cards ── */}
      {!isLoading && users.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RoleSummaryCard role="ROLE_ADMIN"       count={adminCount} total={users.length} />
          <RoleSummaryCard role="ROLE_SUPER_ADMIN" count={superCount} total={users.length} />
          <RoleSummaryCard role="ROLE_CEO_ADMIN"   count={ceoCount}   total={users.length} />
        </div>
      )}

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-400 font-medium flex-shrink-0">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-300">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading members…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Users size={24} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">{search ? 'No members match your search' : 'No members yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(user => {
              const primaryRole = user.roles[0] ?? 'ROLE_ADMIN'
              const rs = ROLE_STYLES[primaryRole]
              const RIcon = rs.icon
              return (
                <button
                  key={user.id}
                  onClick={() => setDetailUser(user)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50/40 transition-colors duration-100 text-left group cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-button">
                    <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                  </div>

                  {/* Role badge */}
                  <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${rs.badge}`}>
                    <RIcon size={11} />
                    {getRoleLabel(primaryRole)}
                  </div>

                  {/* Status dot */}
                  <div className={`hidden md:flex items-center gap-1.5 flex-shrink-0 ${user.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-xs font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>

                  {/* Joined */}
                  <span className="hidden lg:block text-xs text-gray-400 flex-shrink-0 w-24 text-right">
                    {formatDate(user.createdAt)}
                  </span>

                  {/* Quick actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); setEditUser(user); editForm.reset({ name: user.name, email: user.email }) }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setEditUser(user); editForm.reset({ name: user.name, email: user.email }) }}}
                      title="Edit"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 size={12} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); setRoleUser(user); setSelectedRole(user.roles[0]) }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setRoleUser(user); setSelectedRole(user.roles[0]) }}}
                      title="Change Role"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                    >
                      <Shield size={12} />
                    </span>
                    {user.isActive && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => { e.stopPropagation(); setDeactivateTarget(user) }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setDeactivateTarget(user) }}}
                        title="Deactivate"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <UserX size={12} />
                      </span>
                    )}
                  </div>

                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── User detail panel ── */}
      <UserDetailPanel
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={u => { setEditUser(u); editForm.reset({ name: u.name, email: u.email }) }}
        onChangeRole={u => { setRoleUser(u); setSelectedRole(u.roles[0]) }}
        onDeactivate={u => setDeactivateTarget(u)}
      />

      {/* ── Create modal ── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Member">
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="p-6 space-y-4">
          <Input label="Full Name" required error={createForm.formState.errors.name?.message} {...createForm.register('name')} placeholder="John Doe" />
          <Input label="Email" type="email" required error={createForm.formState.errors.email?.message} {...createForm.register('email')} placeholder="john@falcons.com" />
          <Input label="Password" type="password" required error={createForm.formState.errors.password?.message} {...createForm.register('password')} placeholder="Min 6 characters" helperText="User will use this to sign in" />
          <Select label="Role" required options={roleOptions} error={createForm.formState.errors.role?.message} {...createForm.register('role')} />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={createForm.formState.isSubmitting}>Create Member</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit modal ── */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit Member" size="sm">
        <form onSubmit={editForm.handleSubmit(handleEdit)} className="p-6 space-y-4">
          <Input label="Full Name" required error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
          <Input label="Email" type="email" required error={editForm.formState.errors.email?.message} {...editForm.register('email')} />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={editForm.formState.isSubmitting}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ── Change role modal ── */}
      <Modal isOpen={!!roleUser} onClose={() => setRoleUser(null)} title="Change Role" size="sm">
        <div className="p-6 space-y-4">
          {roleUser && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{getInitials(roleUser.name)}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{roleUser.name}</p>
                <p className="text-xs text-gray-400">{roleUser.email}</p>
              </div>
            </div>
          )}
          <Select
            label="New Role"
            options={roleOptions}
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as RoleName)}
          />
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setRoleUser(null)}>Cancel</Button>
            <Button size="sm" onClick={handleRoleChange} isLoading={isActing}>Update Role</Button>
          </div>
        </div>
      </Modal>

      {/* ── Deactivate confirm ── */}
      <ConfirmDialog
        isOpen={!!deactivateTarget} title="Deactivate Member"
        message={`Deactivate ${deactivateTarget?.name}? They will immediately lose access to the system.`}
        confirmLabel="Deactivate" isDestructive isLoading={isActing}
        onConfirm={handleDeactivate} onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
