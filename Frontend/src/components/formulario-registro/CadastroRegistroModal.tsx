import { X } from "lucide-react"

interface CadastroRegistroModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CadastroRegistroModal({
  isOpen,
  onClose,
}: CadastroRegistroModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Cadastrar animal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar modal">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 text-gray-500 text-sm">
          Use a página <a href="/plantel/cadastro" className="text-blue-600 underline">Cadastro de Animal</a> para registrar um novo animal.
        </div>
      </div>
    </div>
  )
}
