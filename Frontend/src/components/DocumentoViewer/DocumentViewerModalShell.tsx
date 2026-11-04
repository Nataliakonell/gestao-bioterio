import React from "react"
import { X, FileText, Loader2 } from "lucide-react"

export interface DocumentViewerModalShellProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  subtitulo?: string
  icon?: React.ReactNode
  acoes?: React.ReactNode
  loading?: boolean
  children: React.ReactNode
}

/**
 * Shell padronizado para modais de visualização de documentos oficiais
 * (Segue exatamente o mesmo modelo, dimensões max-w-4xl, tipografia e cabeçalho de Solicitação de Exame / Atendimentos Clínicos)
 */
export function DocumentViewerModalShell({
  isOpen,
  onClose,
  titulo,
  subtitulo,
  icon,
  acoes,
  loading = false,
  children,
}: DocumentViewerModalShellProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container: max-w-4xl max-h-[94vh] */}
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-[71] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              {icon || <FileText className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {titulo}
              </h2>
              {subtitulo && (
                <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {acoes}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body: bg-slate-100/70 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/70">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border border-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
              <span className="text-sm font-medium text-slate-600">
                Carregando dados e montando documento...
              </span>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
