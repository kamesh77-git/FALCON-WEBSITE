import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:      string
  error?:      string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 leading-none">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={`
            w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900
            placeholder-gray-400 font-medium
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600
            ${error
              ? 'border-red-400 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            ${className}
          `}
        />
        {error      && <p className="text-xs font-medium text-red-600 flex items-center gap-1">⚠ {error}</p>}
        {helperText && !error && <p className="text-xs text-gray-400">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input
