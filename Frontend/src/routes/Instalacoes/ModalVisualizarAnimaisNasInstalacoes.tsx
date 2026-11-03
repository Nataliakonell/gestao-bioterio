import React from "react"
import { useNavigate } from "react-router-dom"
import { Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModalShell } from "@/components/ui/modal-shell"
import { DataTable, type ColumnDef } from "@/components/data-table"
import type { LocalizacaoListVm } from "@/services/LocalizacaoService"
import type { AnimalLocalizacaoListVm } from "@/services/AnimalLocalizacaoService"

interface ModalVisualizarAnimaisNasInstalacoesProps {
  isOpen: boolean
  onClose: () => void
  instalacao: LocalizacaoListVm | null
  animais: AnimalLocalizacaoListVm[]
  loading?: boolean
}

export function ModalVisualizarAnimaisNasInstalacoes({
  isOpen,
  onClose,
  instalacao,
  animais,
  loading = false,
}: ModalVisualizarAnimaisNasInstalacoesProps) {
  const navigate = useNavigate()

  const handleVerFicha = (animalId: number) => {
    onClose()
    navigate(`/plantel/animal/${animalId}`)
  }

  const columns: ColumnDef<AnimalLocalizacaoListVm>[] = [
    {
      header: "Nº Registro",
      accessorKey: "animalNumeroRegistro",
      sortable: true,
      cell: (item) => (
        <span className="font-semibold text-gray-900">
          {item.animalNumeroRegistro || `Animal #${item.animalId}`}
        </span>
      ),
    },
    {
      header: "Espécie",
      accessorKey: "animalEspecieNome",
      sortable: true,
      cell: (item) => (
        <span className="text-gray-700">
          {item.animalEspecieNome || item.animalNomePopular || "-"}
        </span>
      ),
    },
    {
      header: "Ação",
      cellClassName: "text-right",
      headerClassName: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleVerFicha(item.animalId)}
            className="h-8 gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            <FileText className="h-4 w-4" />
            <span>Ver Ficha</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={`Animais em: ${instalacao?.nome ?? "Instalação"}`}
      icon={<Eye className="h-5 w-5" />}
      iconBg="blue"
      size="md"
      footerProps={{
        cancelLabel: "Fechar",
        onCancel: onClose,
      }}
    >
      <div className="p-6">
        <DataTable
          columns={columns}
          data={animais}
          loading={loading}
          emptyMessage="Nenhum animal hospedado nesta sala/instalação."
        />
      </div>
    </ModalShell>
  )
}
