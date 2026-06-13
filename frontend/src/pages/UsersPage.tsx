import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Shield, UserX, Users } from 'lucide-react'
import { getAllUsers, createUser, updateUser, updateUserRole, deactivateUser } from '@/api/users'
import Table from '@/components/ui/Table'
import type { Column } from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { RoleBadge } from '@/components/ui/Badge'
import { getRoleLabel, formatDate } from '@/utils'
import { useToast } from '@/context/ToastContext'
import type { RoleName, UserResponse } from '@/types'

const roleOptions = [
  { value: 'ROLE_ADMIN', label: 'Admin' },
  { value: 'ROLE_SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ROLE_CEO_ADMIN', label: 'CEO Admin' },
]

const roleBadgeColors: Record<RoleName, string> = {
  ROLE_ADMIN: 'bg-gray-100 text-gray-700',
  ROLE_SUPER_ADMIN: 'bg-blue-100 text-blue-800',
  ROLE_CEO_ADMIN: 'bg-purple-100 text-purple-800',
}

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
  role: z.enum(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN']),
})
const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
})
type CreateForm = z.infer<typeof createSchema>
type EditForm = z.infer<typeof editSchema>

export default function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<UserResponse | null>(null)
  const [roleUser, setRoleUser] = useState<UserResponse | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<UserResponse | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleName>('ROLE_ADMIN')
  const [isActing, setIsActing] = useState(false)

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) })
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await getAllUsers()
      setUsers(res.data.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (data: CreateForm) => {
    try {
      await createUser(data)
      showToast('User created', 'success')
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
    } catch {
      showToast('Failed to update user', 'error')
    }
  }

  const handleRoleChange = async () => {
    if (!roleUser) return
    setIsActing(true)
    try {
      await updateUserRole(roleUser.id, { role: selectedRole })
      showToast('Role updated', 'success')
      setRoleUser(null)
      load()
    } catch {
      showToast('Failed to update role', 'error')
    } finally {
      setIsActing(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setIsActing(true)
    try {
      await deactivateUser(deactivateTarget.id)
      showToast('User deactivated', 'success')
      setDeactivateTarget(null)
      load()
    } catch {
      showToast('Failed to deactivate user', 'error')
    } finally {
      setIsActing(false)
    }
  }

  const columns: Column<UserResponse>[] = [
    { key: 'name', header: 'Name', render: r => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: 'email', header: 'Email', render: r => <span className="text-gray-600">{r.email}</span> },
    {
      key: 'roles', header: 'Role',
      render: r => (
        <div className="flex gap-1 flex-wrap">
          {r.roles.map(role => (
            <RoleBadge key={role} label={getRoleLabel(role)} className={roleBadgeColors[role]} />
          ))}
        </div>
      ),
    },
    {
      key: 'isActive', header: 'Status',
      render: r => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Joined', render: r => formatDate(r.createdAt) },
    {
      key: 'actions', header: 'Actions', className: 'w-36',
      render: r => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditUser(r); editForm.reset({ name: r.name, email: r.email }) }} title="Edit" className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => { setRoleUser(r); setSelectedRole(r.roles[0]) }} title="Change Role" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Shield size={15} />
          </button>
          {r.isActive && (
            <button onClick={() => setDeactivateTarget(r)} title="Deactivate" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <UserX size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Add User</Button>
      </div>

      <Table
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="No users yet"
        emptyIcon={<Users size={40} />}
      />

      {/* Create user modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New User">
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="p-5 space-y-4">
          <Input label="Full Name" required error={createForm.formState.errors.name?.message} {...createForm.register('name')} placeholder="John Doe" />
          <Input label="Email" type="email" required error={createForm.formState.errors.email?.message} {...createForm.register('email')} placeholder="john@falcons.com" />
          <Input label="Password" type="password" required error={createForm.formState.errors.password?.message} {...createForm.register('password')} placeholder="Min 6 characters" />
          <Select label="Role" required options={roleOptions} error={createForm.formState.errors.role?.message} {...createForm.register('role')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={createForm.formState.isSubmitting}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit user modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="sm">
        <form onSubmit={editForm.handleSubmit(handleEdit)} className="p-5 space-y-4">
          <Input label="Full Name" required error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
          <Input label="Email" type="email" required error={editForm.formState.errors.email?.message} {...editForm.register('email')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button type="submit" isLoading={editForm.formState.isSubmitting}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Change role modal */}
      <Modal isOpen={!!roleUser} onClose={() => setRoleUser(null)} title="Change Role" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">Change role for <strong>{roleUser?.name}</strong></p>
          <Select
            label="Role"
            options={roleOptions}
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as RoleName)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setRoleUser(null)}>Cancel</Button>
            <Button onClick={handleRoleChange} isLoading={isActing}>Update Role</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        title="Deactivate User"
        message={`Deactivate ${deactivateTarget?.name}? They will lose access to the system.`}
        confirmLabel="Deactivate"
        isDestructive
        isLoading={isActing}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
