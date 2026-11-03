import { X } from "lucide-react"
import { CadastroEspecieForm } from "./CadastroEspecieForm"

interface CadastroEspecieModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CadastroEspecieModal({
  isOpen,
  onClose,
  onSuccess,
}: CadastroEspecieModalProps) {
  if (!isOpen) return null

  const handleSuccess = () => {
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Cadastrar Espécie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fechar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-6">
          <CadastroEspecieForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
