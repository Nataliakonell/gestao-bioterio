import * as React from "react"
import { X, Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CancelConfirmModal } from "@/components/ui/cancel-confirm-modal"

const shellVariants = cva(
  "relative w-full max-h-[94vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-10",
  {
    variants: {
      size: {
        sm: "max-w-md",
        md: "max-w-3xl",
        lg: "max-w-5xl",
      },
    },
    defaultVariants: { size: "md" },
  }
)

type IconBg = "blue" | "violet" | "teal" | "amber" | "slate" | "orange" | "emerald" | "red"

const iconBgMap: Record<IconBg, string> = {
  blue: "bg-blue-50 text-blue-700",
  violet: "bg-violet-50 text-violet-600",
  teal: "bg-teal-50 text-teal-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
  orange: "bg-orange-100 text-orange-700",
  emerald: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
}

interface ModalShellProps extends VariantProps<typeof shellVariants> {
  isOpen: boolean
  onClose: () => void
  /** Titulo exibido no header */
  title: string
  /** Icone (ex: <Scissors className="h-4 w-4" />) */
  icon?: React.ReactNode
  iconBg?: IconBg
  /** Largura: sm=md/ativo 3xl/5xl */
  size?: "sm" | "md" | "lg"
  /** Se true, adiciona animacao de entrada */
  animated?: boolean
  /** Conteudo do body (flex-1 overflow-y-auto) */
  children: React.ReactNode
  /** Footer custom. Se nao passar, use footerProps */
  footer?: React.ReactNode
  /** Props rapidas para footer padrao (Cancelar + Salvar) */
  footerProps?: {
    onCancel?: () => void
    onSave?: () => void
    saveLabel?: string
    cancelLabel?: string
    saving?: boolean
    saveDisabled?: boolean
    cancelDisabled?: boolean
    saveClassName?: string
    hideCancel?: boolean
    /** Conteudo extra à esquerda (ex: botao Voltar) */
    leftActions?: React.ReactNode
    /** Alinhamento: end (default) ou between (quando tem Voltar) */
    align?: "end" | "between"
  }
  /** Controle de dirty -> CancelConfirmModal embutido */
  isDirty?: boolean
  showCancelModal?: boolean
  onCancelModalClose?: () => void
  onCancelModalConfirm?: () => void
  /** Desabilita fechar no backdrop/ESC quando saving/dirty */
  closeOnBackdrop?: boolean
}

export function ModalShell({
  isOpen,
  onClose,
  title,
  icon,
  iconBg = "blue",
  size = "md",
  animated,
  children,
  footer,
  footerProps,
  isDirty: _isDirty,
  showCancelModal,
  onCancelModalClose,
  onCancelModalConfirm,
  closeOnBackdrop = true,
}: ModalShellProps) {
  if (!isOpen) return null

  const handleBackdropClick = () => {
    if (closeOnBackdrop) onClose()
  }

  const align = footerProps?.align ?? (footerProps?.leftActions ? "between" : "end")

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ top: 0, left: 0, width: "100vw", height: "100vh" }} onClick={handleBackdropClick} />
        <div className={cn(shellVariants({ size }), "z-[61]", animated && "animate-in fade-in zoom-in-95")}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              {icon && (
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconBgMap[iconBg])}>
                  {icon}
                </div>
              )}
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">{children}</div>

          {/* Footer */}
          {(footer || footerProps) && (
            <div
              className={cn(
                "flex items-center gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0",
                align === "between" ? "justify-between" : "justify-end"
              )}
            >
              {footer ? (
                footer
              ) : (
                <>
                  {footerProps?.leftActions && <div>{footerProps.leftActions}</div>}
                  <div className="flex items-center gap-2">
                    {!footerProps?.hideCancel && (
                      <Button variant="outline" onClick={footerProps?.onCancel ?? onClose} disabled={footerProps?.cancelDisabled}>
                        {footerProps?.cancelLabel ?? "Cancelar"}
                      </Button>
                    )}
                    {footerProps?.onSave && (
                      <Button
                        onClick={footerProps.onSave}
                        disabled={footerProps?.saving || footerProps?.saveDisabled}
                        className={cn("bg-blue-800 hover:bg-blue-900 text-white font-medium", footerProps?.saveClassName)}
                      >
                        {footerProps?.saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {footerProps?.saveLabel ?? "Salvar"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showCancelModal !== undefined && onCancelModalClose && onCancelModalConfirm && (
        <CancelConfirmModal isOpen={showCancelModal} onClose={onCancelModalClose} onConfirm={onCancelModalConfirm} />
      )}
    </>
  )
}
