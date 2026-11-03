import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface TabItem {
  id: string
  label: string
  icon?: LucideIcon
  disabled?: boolean
}

interface LineTabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function LineTabs({ tabs, activeTab, onChange, className }: LineTabsProps) {
  return (
    <div className={cn("w-full border-b border-gray-200", className)}>
      <div className="flex gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors relative border-b-2 -mb-[1px]",
                isActive 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-900 hover:text-blue-600",
                tab.disabled && "opacity-50 cursor-not-allowed hover:text-gray-900"
              )}
            >
              {Icon && <Icon className="w-[18px] h-[18px]" />}
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
