import React from "react"
import { Pill, FlaskConical, Paperclip, FileText, Scissors, Plus, type LucideIcon } from "lucide-react"

export interface QuickActionItem {
  id: string
  label: string
  icon: LucideIcon
  showPlus?: boolean
  pill?: boolean
  borderColor: string
  bgColor: string
  textColor: string
  iconColor: string
  onClick?: () => void
}

export interface SummaryItem {
  id: string
  label: string
  count?: number
  icon: LucideIcon
  circleBgColor: string
  iconColor: string
}

export interface CardsForSummaryProps {
  quickActionsTitle?: string
  quickActions?: QuickActionItem[]
  summaryTitle?: string
  summaryItems?: SummaryItem[]
  summaryCounts?: Record<string, number>
  className?: string
  onQuickAction?: (actionId: string) => void
  children?: React.ReactNode
}

const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "prescrever-medicacao",
    label: "Prescrever medicação",
    icon: Pill,
    showPlus: true,
    borderColor: "border-teal-300 hover:border-teal-400",
    bgColor: "bg-teal-50/70 hover:bg-teal-100/70",
    textColor: "text-teal-900",
    iconColor: "text-teal-700",
  },
  {
    id: "solicitar-exame",
    label: "Solicitar exame",
    icon: FlaskConical,
    showPlus: true,
    borderColor: "border-amber-300 hover:border-amber-400",
    bgColor: "bg-amber-50/70 hover:bg-amber-100/70",
    textColor: "text-amber-900",
    iconColor: "text-amber-600",
  },
  {
    id: "anexar-documento",
    label: "Anexar documento",
    icon: Paperclip,
    showPlus: true,
    borderColor: "border-slate-300 hover:border-slate-400",
    bgColor: "bg-slate-50/80 hover:bg-slate-100/80",
    textColor: "text-slate-800",
    iconColor: "text-slate-700",
  },
  {
    id: "registrar-evolucao",
    label: "Registrar evolução",
    icon: FileText,
    showPlus: true,
    borderColor: "border-violet-300 hover:border-violet-400",
    bgColor: "bg-violet-50/70 hover:bg-violet-100/70",
    textColor: "text-violet-950",
    iconColor: "text-violet-600",
  },
  {
    id: "adicionar-procedimento",
    label: "Adicionar procedimento",
    icon: Scissors,
    showPlus: true,
    borderColor: "border-blue-300 hover:border-blue-400",
    bgColor: "bg-blue-50/70 hover:bg-blue-100/70",
    textColor: "text-blue-950",
    iconColor: "text-blue-800",
  },
]

const DEFAULT_SUMMARY_ITEMS: SummaryItem[] = [
  {
    id: "medicacoes",
    label: "Medicações",
    count: 0,
    icon: Pill,
    circleBgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "anexos",
    label: "Anexos",
    count: 0,
    icon: Paperclip,
    circleBgColor: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    id: "exames",
    label: "Exames",
    count: 0,
    icon: FlaskConical,
    circleBgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "evolucoes",
    label: "Evoluções",
    count: 0,
    icon: FileText,
    circleBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "procedimentos",
    label: "Procedimentos",
    count: 0,
    icon: Scissors,
    circleBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
]

export function CardsForSummary({
  quickActionsTitle = "Ações rápidas",
  quickActions = DEFAULT_QUICK_ACTIONS,
  summaryTitle = "Resumo do atendimento",
  summaryItems = DEFAULT_SUMMARY_ITEMS,
  summaryCounts,
  className = "",
  onQuickAction,
  children,
}: CardsForSummaryProps) {
  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      {quickActions && quickActions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">{quickActionsTitle}</h3>
          <div className="flex flex-col gap-2.5">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              const roundedClass = action.pill !== false ? "rounded-full" : "rounded-lg"
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    if (action.onClick) action.onClick()
                    if (onQuickAction) onQuickAction(action.id)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 ${roundedClass} border text-sm font-medium transition-all cursor-pointer ${action.borderColor} ${action.bgColor} ${action.textColor}`}
                >
                  <span className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 shrink-0 ${action.iconColor}`} />
                    <span>{action.label}</span>
                  </span>
                  {action.showPlus && (
                    <Plus className={`w-4 h-4 shrink-0 ${action.iconColor}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Card 2: Resumo do atendimento */}
      {summaryItems && summaryItems.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">{summaryTitle}</h3>
          <div className="flex flex-col gap-3">
            {summaryItems.map((item) => {
              const IconComponent = item.icon
              const displayCount = (summaryCounts && item.id in summaryCounts)
                ? summaryCounts[item.id]
                : (item.count ?? 0)

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.circleBgColor}`}
                    >
                      <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[24px] px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {displayCount}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {children}
    </div>
  )
}

export default CardsForSummary
