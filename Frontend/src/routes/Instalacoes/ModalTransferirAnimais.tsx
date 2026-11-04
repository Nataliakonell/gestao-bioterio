import { useState, useMemo, useEffect } from "react"
import { ArrowLeftRight, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ModalShell } from "@/components/ui/modal-shell"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { DataTable, type ColumnDef } from "@/components/data-table"
import type { LocalizacaoListVm } from "@/services/LocalizacaoService"
import { animalLocalizacaoService, type AnimalLocalizacaoListVm } from "@/services/AnimalLocalizacaoService"
import { movimentacaoAnimalService, TipoMovimentacao } from "@/services/MovimentacaoAnimalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"

interface ModalTransferirAnimaisProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  origem: LocalizacaoListVm | null
  localizacoes: LocalizacaoListVm[]
}

const generoMap: Record<number, string> = {
  1: "Macho",
  2: "Fêmea",
  3: "Não Identificado",
}

const faseDeVidaMap: Record<number, string> = {
  1: "Filhote",
  2: "Jovem",
  3: "Adulto",
}

export function ModalTransferirAnimais({
  isOpen,
  onClose,
  onSuccess,
  origem,
  localizacoes,
}: ModalTransferirAnimaisProps) {
  const [destinoId, setDestinoId] = useState<string>("")
  const [animaisOrigem, setAnimaisOrigem] = useState<AnimalLocalizacaoListVm[]>([])
  const [loadingAnimais, setLoadingAnimais] = useState(false)
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<number>>(new Set())

  // Filtros da BarraDeBuscaEFiltro
  const [search, setSearch] = useState("")
  const [selectedEspecie, setSelectedEspecie] = useState("")
  const [selectedGenero, setSelectedGenero] = useState<string[]>([])
  const [selectedFaseDeVida, setSelectedFaseDeVida] = useState<string[]>([])
  const [especiesLookup, setEspeciesLookup] = useState<EspecieLookupVm[]>([])

  // Busca espécies para o filtro select
  useEffect(() => {
    if (isOpen) {
      especieService.getLookup().then(setEspeciesLookup).catch(() => {})
    }
  }, [isOpen])

  // Carrega os animais alocados na instalação de origem ao abrir a modal
  useEffect(() => {
    if (isOpen && origem) {
      setDestinoId("")
      setSelectedAnimalIds(new Set())
      setSearch("")
      setSelectedEspecie("")
      setSelectedGenero([])
      setSelectedFaseDeVida([])

      const carregarAnimais = async () => {
        try {
          setLoadingAnimais(true)
          const data = await animalLocalizacaoService.getByLocalizacaoId(origem.id)
          setAnimaisOrigem(data)
        } catch {
          toast.error("Erro ao carregar animais da instalação de origem.")
        } finally {
          setLoadingAnimais(false)
        }
      }

      carregarAnimais()
    }
  }, [isOpen, origem])

  // Salas elegíveis para destino: filhas (ou que não sejam pais) e DIFERENTES da origem
  const salasDestinoDisponiveis = useMemo(() => {
    if (!origem) return []
    const idsPais = new Set(
      localizacoes
        .map((loc) => loc.localizacaoPaiId)
        .filter((id): id is number => id !== null && id !== undefined)
    )

    return localizacoes.filter((loc) => {
      if (loc.id === origem.id) return false // Não permitir a mesma instalação de origem
      // Preferencialmente salas finais (sem filhos)
      return !idsPais.has(loc.id)
    })
  }, [localizacoes, origem])

  // Filtragem local dos animais da instalação de origem
  const animaisFiltrados = useMemo(() => {
    return animaisOrigem.filter((item) => {
      // Busca textual (número de registro, espécie ou nome popular)
      if (search.trim()) {
        const termo = search.trim().toLowerCase()
        const matchRegistro = item.animalNumeroRegistro?.toLowerCase().includes(termo)
        const matchEspecie = item.animalEspecieNome?.toLowerCase().includes(termo)
        const matchPopular = item.animalNomePopular?.toLowerCase().includes(termo)
        if (!matchRegistro && !matchEspecie && !matchPopular) return false
      }

      // Filtro de Espécie
      if (selectedEspecie) {
        if (item.animalEspecieId !== undefined && item.animalEspecieId !== null) {
          if (String(item.animalEspecieId) !== selectedEspecie) return false
        } else if (item.animalEspecieNome) {
          const especieEncontrada = especiesLookup.find((e) => String(e.id) === selectedEspecie)
          if (especieEncontrada && item.animalEspecieNome !== especieEncontrada.nome) {
            return false
          }
        }
      }

      // Filtro de Gênero
      if (selectedGenero.length > 0) {
        if (!item.animalGenero || !selectedGenero.includes(String(item.animalGenero))) {
          return false
        }
      }

      // Filtro de Fase de Vida
      if (selectedFaseDeVida.length > 0) {
        if (!item.animalFaseDeVida || !selectedFaseDeVida.includes(String(item.animalFaseDeVida))) {
          return false
        }
      }

      return true
    })
  }, [animaisOrigem, search, selectedEspecie, selectedGenero, selectedFaseDeVida, especiesLookup])

  // Controle de seleção em massa (apenas dos itens filtrados/visíveis)
  const todosFiltradosSelecionados = useMemo(() => {
    if (animaisFiltrados.length === 0) return false
    return animaisFiltrados.every((item) => selectedAnimalIds.has(item.animalId))
  }, [animaisFiltrados, selectedAnimalIds])

  const toggleSelectAll = (checked: boolean) => {
    const next = new Set(selectedAnimalIds)
    if (checked) {
      animaisFiltrados.forEach((item) => next.add(item.animalId))
    } else {
      animaisFiltrados.forEach((item) => next.delete(item.animalId))
    }
    setSelectedAnimalIds(next)
  }

  const toggleSelectAnimal = (animalId: number) => {
    const next = new Set(selectedAnimalIds)
    if (next.has(animalId)) {
      next.delete(animalId)
    } else {
      next.add(animalId)
    }
    setSelectedAnimalIds(next)
  }

  // Colunas do DataTable com checkbox de seleção
  const columns: ColumnDef<AnimalLocalizacaoListVm>[] = [
    {
      header: " ",
      width: 48,
      headerClassName: "text-center w-12",
      cellClassName: "text-center w-12",
      cell: (item) => {
        const isSelected = selectedAnimalIds.has(item.animalId)
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelectAnimal(item.animalId)}
              aria-label={`Selecionar animal ${item.animalNumeroRegistro || item.animalId}`}
            />
          </div>
        )
      },
    },
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
        <span className="text-gray-700 italic">
          {item.animalEspecieNome || item.animalNomePopular || "-"}
        </span>
      ),
    },
    {
      header: "Fase de Vida",
      accessorKey: "animalFaseDeVida",
      sortable: true,
      cell: (item) => (
        <span className="text-gray-700">
          {item.animalFaseDeVida ? (faseDeVidaMap[item.animalFaseDeVida] ?? "-") : "-"}
        </span>
      ),
    },
    {
      header: "Gênero",
      accessorKey: "animalGenero",
      sortable: true,
      cell: (item) => (
        <span className="text-gray-700">
          {item.animalGenero ? (generoMap[item.animalGenero] ?? "-") : "-"}
        </span>
      ),
    },
  ]

  // Ação de submissão da transferência em lote
  const handleTransferir = async (): Promise<boolean | void> => {
    if (!destinoId) {
      toast.error("Selecione a instalação de destino.")
      return false
    }

    if (selectedAnimalIds.size === 0) {
      toast.error("Selecione pelo menos um animal para transferir.")
      return false
    }

    const destinoNum = Number(destinoId)
    if (origem && destinoNum === origem.id) {
      toast.error("O local de destino não pode ser igual ao local de origem.")
      return false
    }

    try {
      const animalIdsArray = Array.from(selectedAnimalIds)
      await Promise.all(
        animalIdsArray.map((animalId) =>
          movimentacaoAnimalService.create({
            animalId,
            localizacaoId: destinoNum,
            localizacaoDestinoId: destinoNum,
            tipoMovimentacao: TipoMovimentacao.Transferencia, // Transferência
            responsavel: "Operador",
            observacao: `Transferência em lote de "${origem?.nome}" para destino.`,
          })
        )
      )

      toast.success(
        `${animalIdsArray.length} animal(is) transferido(s) com sucesso!`
      )
      onSuccess()
      onClose()
      return true
    } catch (error) {
      toast.error("Erro ao realizar a transferência de animais.")
      return false
    }
  }

  const checkIsDirty = () => {
    return selectedAnimalIds.size > 0 || !!destinoId
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Transferir Animais"
      icon={<ArrowLeftRight className="h-5 w-5" />}
      iconBg="blue"
      size="lg"
      footer={null}
    >
      <div className="p-6">
        <FormLayoutBase
          onSubmit={handleTransferir}
          onCancel={onClose}
          checkIsDirty={checkIsDirty}
          submitLabel="Transferir animais"
          titleFirstSection="Definição dos locais de transferência"
          columnsClassName="grid-cols-1 md:grid-cols-2"
          extraSections={
            <FormSection
              title="Seleção dos animais"
              className="mt-6 border-gray-200 bg-white"
            >
              {/* Cabeçalho da Seção 2: Título, contador dinâmico e Selecionar Todos */}
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-semibold text-gray-900">
                    Animais a transferir
                  </h4>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                    {selectedAnimalIds.size} selecionado{selectedAnimalIds.size === 1 ? "" : "s"}
                  </span>
                </div>

                {animaisFiltrados.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900">
                    <Checkbox
                      checked={todosFiltradosSelecionados}
                      onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    />
                    <span>Selecionar todos ({animaisFiltrados.length})</span>
                  </label>
                )}
              </div>

              {/* Tabela de Animais com DataTable */}
              <DataTable
                columns={columns}
                data={animaisFiltrados}
                loading={loadingAnimais}
                emptyMessage={
                  animaisOrigem.length === 0
                    ? "Não há animais alocados na instalação de origem para transferência."
                    : "Nenhum animal corresponde aos filtros selecionados."
                }
              />
            </FormSection>
          }
        >
          {/* Seção 1 – Campos dos locais e BarraDeBuscaEFiltro */}
          <div className="space-y-4 col-span-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Local de Origem: Preenchido automaticamente, somente leitura */}
              <FormField label="Local de Origem" required>
                <Input
                  value={origem ? origem.nome : ""}
                  readOnly
                  disabled
                  className="bg-gray-100/80 text-gray-700 font-medium cursor-not-allowed border-gray-200"
                />
              </FormField>

              {/* 2. Local de Destino: Seletor não permitindo a própria origem */}
              <FormField label="Local de Destino" required>
                <Select value={destinoId} onValueChange={setDestinoId}>
                  <SelectTrigger className="w-full bg-white border-gray-200">
                    <SelectValue placeholder="Selecione a instalação de destino..." />
                  </SelectTrigger>
                  <SelectContent>
                    {salasDestinoDisponiveis.map((loc) => (
                      <SelectItem key={loc.id} value={String(loc.id)}>
                        {loc.nome}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* BarraDeBuscaEFiltro integrada com busca e filtros do sistema */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">
                Filtrar animais da instalação de origem:
              </span>
              <BarraDeBuscaEFiltro
                search={search}
                onSearchChange={setSearch}
                placeholder="Pesquisar por registro ou espécie..."
                filterSections={[
                  {
                    key: "especie",
                    label: "Espécie",
                    type: "select",
                    options: especiesLookup.map((e) => ({
                      value: String(e.id),
                      label: e.nome,
                    })),
                    selectedValue: selectedEspecie,
                    onValueChange: setSelectedEspecie,
                  },
                  {
                    key: "genero",
                    label: "Gênero",
                    type: "checkbox",
                    options: [
                      { value: "1", label: "Macho" },
                      { value: "2", label: "Fêmea" },
                      { value: "3", label: "Não Identificado" },
                    ],
                    selected: selectedGenero,
                    onChange: setSelectedGenero,
                  },
                  {
                    key: "faseDeVida",
                    label: "Fase de Vida",
                    type: "checkbox",
                    options: [
                      { value: "1", label: "Filhote" },
                      { value: "2", label: "Jovem" },
                      { value: "3", label: "Adulto" },
                    ],
                    selected: selectedFaseDeVida,
                    onChange: setSelectedFaseDeVida,
                  },
                ]}
              />
            </div>
          </div>
        </FormLayoutBase>
      </div>
    </ModalShell>
  )
}
