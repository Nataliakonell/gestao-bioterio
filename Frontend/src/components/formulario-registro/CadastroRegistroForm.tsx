import { useState, useEffect, ReactNode } from "react"
import { CloudUpload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CancelConfirmModal } from "@/components/ui/cancel-confirm-modal"

export function FormSection({
  title,
  children,
  className = "",
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-gray-50 p-6 ${className}`}>
      {title && <h3 className="mb-4 text-xl font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
  )
}

export interface FormLayoutBaseProps {
  children?: ReactNode
  extraSections?: ReactNode
  onSubmit: () => Promise<void | boolean>
  onCancel: () => void
  onDelete?: () => void
  deleteLabel?: string
  checkIsDirty: () => boolean
  titleFirstSection?: string
  submitLabel: string
  hasProfilePhoto?: boolean
  initialPhotoUrl?: string | null
  onPhotoChange?: (file: File) => void
  columnsClassName?: string
  sideContent?: ReactNode
  hideSubmit?: boolean
}

export function FormLayoutBase({
  children,
  extraSections,
  onSubmit,
  onCancel,
  onDelete,
  deleteLabel = "Excluir",
  checkIsDirty,
  titleFirstSection = "Informações Básicas",
  submitLabel,
  hasProfilePhoto = false,
  initialPhotoUrl = null,
  onPhotoChange,
  columnsClassName = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  sideContent,
  hideSubmit = false,
}: FormLayoutBaseProps) {
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  useEffect(() => {
    if (initialPhotoUrl) setPreviewUrl(initialPhotoUrl)
  }, [initialPhotoUrl])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem excede o limite de 10 MB.")
      return
    }
    setPreviewUrl(URL.createObjectURL(file))
    onPhotoChange?.(file)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await onSubmit()
      if (result !== false) {
        setIsRedirecting(true)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = () => {
    if (checkIsDirty()) {
      setIsCancelModalOpen(true)
    } else {
      onCancel()
    }
  }

  const confirmCancel = () => {
    setIsCancelModalOpen(false)
    onCancel()
  }

  const firstSectionContent = (children || hasProfilePhoto) ? (
    <FormSection title={titleFirstSection}>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {hasProfilePhoto && (
          <div className="shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil</label>
            <label className="flex flex-col items-center justify-center w-36 h-36 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition overflow-hidden select-none">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <CloudUpload className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-blue-600">Adicionar foto</span>
                  <span className="text-xs text-gray-400">PNG, JPG</span>
                </>
              )}
              <Input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            <p className="mt-2 text-[11px] text-gray-500 text-center font-medium">Máximo: 10 MB</p>
          </div>
        )}

        {/* Grid de campos */}
        <div className={`flex-1 grid ${columnsClassName} gap-6 w-full`}>
          {children}
        </div>
      </div>
    </FormSection>
  ) : null;

  const actionButtons = (
    <div className="flex justify-end gap-3 pt-2 relative items-center">
      {onDelete && (
        <div className="absolute left-0">
          <button
            type="button"
            onClick={onDelete}
            disabled={loading || isRedirecting}
            className="text-xs font-medium text-gray-400 hover:text-red-500 hover:underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLabel}
          </button>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleCancelClick}
        disabled={loading || isRedirecting}
        className="px-6"
      >
        {hideSubmit ? "Voltar" : "Cancelar"}
      </Button>
      {!hideSubmit && (
        <Button
          type="submit"
          disabled={loading || isRedirecting}
          className="gap-2 bg-brand hover:brightness-95 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || isRedirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      )}
    </div>
  )

  return (
    <>
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* Layout com coluna principal (esquerda) e coluna lateral (direita) */}
      {sideContent ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-8">
            {firstSectionContent}
            {extraSections}
            {actionButtons}
          </div>
          <div className="lg:col-span-4">
            {sideContent}
          </div>
        </div>
      ) : (
        <>
          {firstSectionContent}
          {extraSections}
          {actionButtons}
        </>
      )}
    </form>
    
    <CancelConfirmModal
      isOpen={isCancelModalOpen}
      onClose={() => setIsCancelModalOpen(false)}
      onConfirm={confirmCancel}
    />
    </>
  )
}