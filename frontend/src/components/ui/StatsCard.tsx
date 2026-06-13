import type { ReactNode } from 'react'

interface StatsCardProps {
  title:    string
  value:    string | number
  icon:     ReactNode
  iconBg?:  string
  subtitle?: string
  trend?:   { value: string; up: boolean }
}

export default function StatsCard({ title, value, icon, iconBg = 'bg-primary-50', subtitle, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-card hover:shadow-card-md transition-shadow duration-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 leading-none">{value}</p>
        {trend && (
          <p className={`text-xs font-semibold mt-1.5 ${trend.up ? 'text-green-600' : 'text-red-500'}`}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </p>
        )}
        {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  )
}
