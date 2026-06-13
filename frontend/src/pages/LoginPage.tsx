import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail, UserCog, Shield, Crown, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

// ─── Quick-login role presets ─────────────────────────────────────────────────

const ROLES = [
  {
    key:      'admin'  as const,
    label:    'Admin',
    tagline:  'Shipment operations',
    email:    'admin@falcons.com',
    password: 'Admin@123',
    icon:     UserCog,
    iconBg:   'bg-slate-100',
    iconText: 'text-slate-600',
    activeBg: 'bg-blue-50 border-blue-300',
    chip:     'bg-slate-100 text-slate-600',
  },
  {
    key:      'super'  as const,
    label:    'Super Admin',
    tagline:  'Finance & invoices',
    email:    'superadmin@falcons.com',
    password: 'Super@123',
    icon:     Shield,
    iconBg:   'bg-blue-100',
    iconText: 'text-blue-600',
    activeBg: 'bg-blue-50 border-blue-300',
    chip:     'bg-blue-100 text-blue-700',
  },
  {
    key:      'ceo'    as const,
    label:    'CEO Admin',
    tagline:  'Full system access',
    email:    'ceo@falcons.com',
    password: 'Ceo@123',
    icon:     Crown,
    iconBg:   'bg-violet-100',
    iconText: 'text-violet-600',
    activeBg: 'bg-violet-50 border-violet-300',
    chip:     'bg-violet-100 text-violet-700',
  },
] as const

type RoleKey = typeof ROLES[number]['key']

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [activeRole, setActiveRole]     = useState<RoleKey | null>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fillRole = (role: typeof ROLES[number]) => {
    setValue('email',    role.email,    { shouldValidate: true })
    setValue('password', role.password, { shouldValidate: true })
    setActiveRole(role.key)
    setError('')
  }

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.email, data.password)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex">

      {/* ── Left panel — white card with role quick-login ── */}
      <div className="hidden lg:flex flex-col justify-between w-[400px] flex-shrink-0 bg-white border-r border-blue-100 p-10">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-button">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-base leading-none">Falcons</p>
            <p className="text-blue-400 text-xs mt-0.5 font-semibold">Logistics</p>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Manage shipments<br />
            with precision.
          </h2>
          <p className="text-gray-400 text-sm mt-3 leading-relaxed">
            Role-based access, real-time tracking, and complete invoice management for your logistics operations.
          </p>
        </div>

        {/* Quick-login role cards */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Quick Sign-in</p>
          {ROLES.map(role => {
            const Icon     = role.icon
            const isActive = activeRole === role.key
            return (
              <button
                key={role.key}
                type="button"
                onClick={() => fillRole(role)}
                className={`
                  group flex items-center gap-3 w-full p-3.5 rounded-xl border text-left
                  transition-all duration-150 cursor-pointer
                  ${isActive
                    ? role.activeBg
                    : 'bg-white border-gray-100 hover:bg-blue-50 hover:border-blue-200'
                  }
                `}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${role.iconBg}`}>
                  <Icon size={16} className={role.iconText} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 leading-none">{role.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{role.tagline}</p>
                </div>
                {isActive ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${role.chip}`}>
                    Filled
                  </span>
                ) : (
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-button">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <p className="text-gray-900 font-bold text-base leading-none">Falcons Logistics</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card-lg p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-400 text-sm mt-1.5">Sign in to your account to continue</p>
            </div>

            {/* Mobile quick-login chips */}
            <div className="flex gap-2 mb-5 lg:hidden">
              {ROLES.map(role => {
                const Icon     = role.icon
                const isActive = activeRole === role.key
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => fillRole(role)}
                    className={`
                      flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center
                      transition-all duration-150 cursor-pointer
                      ${isActive
                        ? role.activeBg
                        : 'bg-gray-50 border-gray-100 hover:bg-blue-50 hover:border-blue-200'
                      }
                    `}
                  >
                    <Icon size={14} className={role.iconText} />
                    <span className="text-[10px] font-bold text-gray-500 leading-tight">{role.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Active role hint */}
            {activeRole && (
              <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-600 font-medium">
                  Credentials filled for <span className="font-bold">{ROLES.find(r => r.key === activeRole)?.label}</span> — click Sign in
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@falcons.com"
                    autoComplete="email"
                    {...register('email')}
                    onChange={e => { register('email').onChange(e); setActiveRole(null) }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 transition-all duration-150
                      bg-gray-50 border focus:outline-none focus:ring-2 focus:bg-white
                      ${errors.email
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 hover:border-blue-200 focus:border-primary-400 focus:ring-primary-100'
                      }`}
                  />
                </div>
                {errors.email && <p className="text-xs font-medium text-red-500">⚠ {errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    onChange={e => { register('password').onChange(e); setActiveRole(null) }}
                    className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 transition-all duration-150
                      bg-gray-50 border focus:outline-none focus:ring-2 focus:bg-white
                      ${errors.password
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 hover:border-blue-200 focus:border-primary-400 focus:ring-primary-100'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs font-medium text-red-500">⚠ {errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight size={18} />}
              >
                Sign in
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 font-medium">
            Falcons Logistics © 2026 · All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}
