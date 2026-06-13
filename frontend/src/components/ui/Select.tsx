import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string
  error?:       string
  options:      Option[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-gray-700 leading-none">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          {...props}
          className={`
            w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 font-medium
            bg-white transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600
            cursor-pointer appearance-none
            ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 hover:border-gray-300'}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '40px' }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs font-medium text-red-600">⚠ {error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
export default Select
