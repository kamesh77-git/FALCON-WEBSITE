import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

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
    <div className="min-h-screen bg-navy flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-navy-800 p-10 border-r border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-button">
            <Zap size={17} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">Falcons</p>
            <p className="text-navy-600 text-xs mt-0.5 font-medium">Logistics</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Manage shipments<br />
            with precision.
          </h2>
          <p className="text-navy-600 text-sm mt-3 leading-relaxed">
            Role-based access, real-time tracking, and complete invoice management for your logistics operations.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {['Admin', 'Super Admin', 'CEO Admin'].map(role => (
            <div key={role} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
              <p className="text-sm text-gray-400 font-medium">{role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Zap size={17} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">Falcons Logistics</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-navy-600 text-sm mt-1.5 font-medium">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium">
              <span className="flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-gray-300">
                Email address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-600 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@falcons.com"
                  autoComplete="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-navy-700 transition-all duration-150
                    bg-white/[0.06] border focus:outline-none focus:ring-2
                    ${errors.email
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-white/[0.10] hover:border-white/[0.18] focus:border-primary-500 focus:ring-primary-500/20'
                    }`}
                />
              </div>
              {errors.email && <p className="text-xs font-medium text-red-400">⚠ {errors.email.message}</p>}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-gray-300">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-600 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium text-white placeholder-navy-700 transition-all duration-150
                    bg-white/[0.06] border focus:outline-none focus:ring-2
                    ${errors.password
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-white/[0.10] hover:border-white/[0.18] focus:border-primary-500 focus:ring-primary-500/20'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-600 hover:text-gray-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-red-400">⚠ {errors.password.message}</p>}
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

          <p className="text-center text-xs text-navy-700 mt-8 font-medium">
            Falcons Logistics © 2025 · All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}
