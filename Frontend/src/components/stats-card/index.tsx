import type { ReactNode } from "react"

export interface StatsCardProps {
  label: string
  value: string | number
  description?: string
  icon?: ReactNode
  onClick?: () => void
  className?: string
}

export function StatsCard({
  label,
  value,
  description,
  icon,
  onClick,
  className = "",
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card p-3.5 sm:p-4 md:p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? "cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300 truncate" title={label}>
          {label}
        </p>
        {icon && <div className="text-gray-500 dark:text-zinc-400 shrink-0 ml-2">{icon}</div>}
      </div>
      <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-300 truncate" title={description}>
          {description}
        </p>
      )}
    </div>
  )
}
