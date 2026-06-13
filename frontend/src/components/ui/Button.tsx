import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type Size    = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant
  size?:     Size
  isLoading?: boolean
  leftIcon?:  ReactNode
  rightIcon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary:   'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-button border border-primary-700/20',
  secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-200 shadow-button',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-button border border-red-700/20',
  ghost:     'text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 border border-transparent',
  outline:   'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
}

const sizes: Record<Size, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
  sm: 'px-3.5 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-150
        focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-[2.5px] border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
