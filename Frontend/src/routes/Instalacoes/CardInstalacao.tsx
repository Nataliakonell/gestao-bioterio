import React from "react"
import { MapPin, Pencil, Eye, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { LocalizacaoListVm } from "@/services/LocalizacaoService"

interface CardInstalacaoProps {
  localizacao: LocalizacaoListVm
  descricao?: string
  onEdit: (localizacao: LocalizacaoListVm) => void
  onVerAnimais: (localizacao: LocalizacaoListVm) => void
  onTransferir: (localizacao: LocalizacaoListVm) => void
}

export function CardInstalacao({
  localizacao,
  descricao,
  onEdit,
  onVerAnimais,
  onTransferir,
}: CardInstalacaoProps) {
  // Descrição padrão ou personalizada (se não fornecida, usa o caminho da hierarquia ou texto informativo)
  const textoDescricao =
    descricao ||
    (localizacao.caminhoHierarquia && localizacao.caminhoHierarquia !== localizacao.nome
      ? `Localização: ${localizacao.caminhoHierarquia}`
      : "Área de alojamento e manejo dos animais do biotério.")

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
      {/* 2. Cabeçalho do Card */}
      <div>
        <div className="flex items-center justify-between gap-2">
          {/* Lado Esquerdo: Ícone de localização (azul) + Nome em negrito */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="truncate text-base font-bold text-gray-900" title={localizacao.nome}>
              {localizacao.nome}
            </h3>
          </div>

          {/* Lado Direito: Ícone de lápis interativo */}
          <button
            type="button"
            onClick={() => onEdit(localizacao)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Editar instalação"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {/* 3. Descrição (Corpo do Card) */}
        <p className="mt-3.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {textoDescricao}
        </p>
      </div>

      {/* 4. Rodapé do Card (Ações/Botões) */}
      <div className="mt-6 flex items-center gap-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onVerAnimais(localizacao)}
          className="flex-1 gap-1.5 border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-xs sm:text-sm font-medium"
        >
          <Eye className="h-4 w-4 text-gray-500" />
          <span>Ver animais ({localizacao.quantidadeAnimais ?? 0})</span>
        </Button>

        {/* Botão 2 (Primário/Filled): Azul escuro + Transferir */}
        <Button
          type="button"
          onClick={() => onTransferir(localizacao)}
          className="flex-1 gap-1.5 bg-blue-900 text-white hover:bg-blue-950 text-xs sm:text-sm font-medium shadow-sm"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Transferir</span>
        </Button>
      </div>
    </div>
  )
}
