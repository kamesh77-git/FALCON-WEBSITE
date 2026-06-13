import type { ReactNode } from 'react'

export interface Column<T> {
  key:       string
  header:    string
  render?:   (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns:      Column<T>[]
  data:         T[]
  isLoading?:   boolean
  onRowClick?:  (row: T) => void
  emptyMessage?: string
  emptyIcon?:   ReactNode
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div
            className="h-3.5 bg-gray-100 rounded-lg animate-pulse"
            style={{ width: `${50 + Math.random() * 40}%` }}
          />
        </td>
      ))}
    </tr>
  )
}

export default function Table<T extends object>({
  columns, data, isLoading, onRowClick, emptyMessage = 'No records found', emptyIcon,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-blue-100 shadow-card bg-white">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-100">
            {columns.map(col => (
              <th
                key={col.key}
                scope="col"
                className={`px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap first:rounded-tl-2xl last:rounded-tr-2xl ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-20 text-center">
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  {emptyIcon && <div className="opacity-30">{emptyIcon}</div>}
                  <p className="text-sm font-medium text-gray-400">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`group transition-colors duration-100 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-primary-50/60'
                    : 'hover:bg-gray-50/60'
                }`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-5 py-3.5 text-gray-600 whitespace-nowrap ${col.className ?? ''}`}>
                    {col.render
                      ? col.render(row)
                      : <span className="text-gray-700">{String((row as Record<string, unknown>)[col.key] ?? '—')}</span>
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
