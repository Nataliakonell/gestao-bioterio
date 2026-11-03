


interface AnimalData {
  id: number
  registro: string
  nomePopular: string
  especie: string
  nroChipe: string
  entrada: string
}

interface ConfirmacaoCadastroModalProps {
  isOpen: boolean
  animalData: AnimalData | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmacaoCadastroModal({
  isOpen,
  animalData,
}: ConfirmacaoCadastroModalProps) {
  if (!isOpen || !animalData) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Cadastro realizado com sucesso
            </h2>
          </div>
        </div>
      </div>
    </div>
  )
}
