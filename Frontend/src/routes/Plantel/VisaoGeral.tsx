import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { StatsCard } from "@/components/stats-card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { animalService, type AnimalListItem } from "@/services/animalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import HeaderGeral from "@/components/header-geral"
import { HeaderContainer } from "@/components/header-container"
import { PageContainer } from "@/components/page-container"
import { DataTable, type ColumnDef } from "@/components/data-table"
import type { DateRange } from "react-day-picker"
import { usePermissions } from "@/contexts/PermissionsContext"

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

const situacaoMap: Record<number, string> = {
  1: "Vivo",
  2: "Óbito",
  3: "Reintroduzido",
}

export default function VisaoGeral() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [animals, setAnimals] = useState<AnimalListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  const [selectedSituacao, setSelectedSituacao] = useState<string[]>([])
  const [selectedGenero, setSelectedGenero] = useState<string[]>([])
  const [especies, setEspecies] = useState<EspecieLookupVm[]>([])
  const [selectedEspecie, setSelectedEspecie] = useState("")
  const [selectedFaseDeVida, setSelectedFaseDeVida] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const [globalCounts, setGlobalCounts] = useState({
    total: 0,
    vivos: 0,
    obitos: 0,
    reintroduzidos: 0,
  })

  const fetchAnimals = useCallback(async () => {
    try {
      setLoading(true)

      const situacaoParam = selectedSituacao.length === 1 ? Number(selectedSituacao[0]) : undefined
      const generoParam = selectedGenero.length === 1 ? Number(selectedGenero[0]) : undefined
      const especieIdParam = selectedEspecie ? Number(selectedEspecie) : undefined

      const data = await animalService.getAllPaginated({
        page,
        pageSize,
        situacaoAnimal: situacaoParam,
        genero: generoParam,
        especieId: especieIdParam,
        faseDeVida: selectedFaseDeVida.length > 0 ? selectedFaseDeVida.join(",") : undefined,
        search: search || undefined,
      })

      if (Array.isArray(data)) {
        setAnimals(data)
        setTotalCount(data.length)
      } else {
        setAnimals(data.items || [])
        setTotalCount(data.totalCount || 0)
      }
    } catch (error) {
      console.error("Erro ao buscar animais:", error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, selectedSituacao, selectedGenero, selectedEspecie, selectedFaseDeVida, search])

  useEffect(() => {
    especieService.getLookup().then(setEspecies).catch(() => { })
  }, [])

  useEffect(() => {
    const fetchGlobalCounts = async () => {
      try {
        const [vivos, obitos, reintroduzidos] = await Promise.all([
          animalService.getAllPaginated({ situacaoAnimal: 1, pageSize: 1 }),
          animalService.getAllPaginated({ situacaoAnimal: 2, pageSize: 1 }),
          animalService.getAllPaginated({ situacaoAnimal: 3, pageSize: 1 }),
        ])

        const getCount = (res: any) =>
          Array.isArray(res) ? res.length : res.totalCount || 0

        setGlobalCounts({
          total: getCount(vivos) + getCount(obitos) + getCount(reintroduzidos),
          vivos: getCount(vivos),
          obitos: getCount(obitos),
          reintroduzidos: getCount(reintroduzidos),
        })
      } catch (error) {
        console.error("Erro ao buscar totais globais:", error)
      }
    }
    fetchGlobalCounts()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [selectedSituacao, selectedGenero, selectedEspecie, selectedFaseDeVida, search, pageSize])

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  // Date range filter is applied client-side since the backend doesn't support it
  const filteredAnimals = animals.filter((animal) => {
    let matchesDate = true
    if (dateRange?.from) {
      const entrada = new Date(animal.dataDeEntrada)
      entrada.setHours(0, 0, 0, 0)
      const from = new Date(dateRange.from)
      from.setHours(0, 0, 0, 0)
      if (dateRange.to) {
        const to = new Date(dateRange.to)
        to.setHours(23, 59, 59, 999)
        matchesDate = entrada >= from && entrada <= to
      } else {
        matchesDate = entrada.getTime() === from.getTime()
      }
    }
    return matchesDate
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral />
            <div className="flex items-center gap-4">
              {hasPermission("Animal", "Gerenciar") && <AddButton newTab />}
            </div>
          </HeaderContainer>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatsCard
                label="Total de animais"
                value={globalCounts.total.toString()}
              />
              <StatsCard
                label="Vivos"
                value={globalCounts.vivos.toString()}
              />
              <StatsCard
                label="Óbitos"
                value={globalCounts.obitos.toString()}
              />
              <StatsCard
                label="Reintroduzidos"
                value={globalCounts.reintroduzidos.toString()}
              />
            </div>

            <BarraDeBuscaEFiltro
              search={search}
              onSearchChange={setSearch}
              placeholder="Ex: Registro, Espécie ou Nº Chip..."
              filterSections={[
                {
                  key: "situacao",
                  label: "Situação",
                  type: "checkbox",
                  options: [
                    { value: "1", label: "Vivo", count: globalCounts.vivos },
                    { value: "2", label: "Óbito", count: globalCounts.obitos },
                    { value: "3", label: "Reintroduzido", count: globalCounts.reintroduzidos },
                  ],
                  selected: selectedSituacao,
                  onChange: setSelectedSituacao,
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
                {
                  key: "dataEntrada",
                  label: "Data de Entrada",
                  type: "dateRange",
                  dateRange: dateRange,
                  onDateRangeChange: setDateRange,
                },
                {
                  key: "especie",
                  label: "Espécie",
                  type: "select",
                  options: especies.map((especie) => ({
                    value: especie.id.toString(),
                    label: especie.nome,
                  })),
                  selectedValue: selectedEspecie,
                  onValueChange: setSelectedEspecie,
                },
              ]}
            />

            {loading ? (
              <div className="flex justify-center items-center py-20 text-gray-500">
                Carregando...
              </div>
            ) : (
              <DataTable
                data={filteredAnimals}
                loading={loading}
                emptyMessage={
                  search
                    ? "Nenhum animal encontrado para a busca."
                    : "Nenhum animal cadastrado."
                }
                onRowClick={(animal) => navigate(`/plantel/animal/${animal.id}`)}
                columns={[
                  { header: "Registro", accessorKey: "numeroRegistro", sortable: true },
                  { header: "Espécie", accessorKey: "especieNome", sortable: true },
                  { header: "Nº Chip", accessorKey: "numeroChip" },
                  {
                    header: "Entrada",
                    accessorKey: "dataDeEntrada",
                    cell: (animal) => {
                      if (!animal.dataDeEntrada) return "-";
                      const [a, m, d] = animal.dataDeEntrada.split("T")[0].split("-").map(Number);
                      return new Date(a, m - 1, d).toLocaleDateString("pt-BR");
                    },
                  },
                  {
                    header: "Gênero",
                    cell: (animal) => generoMap[animal.genero] ?? "-",
                    accessorKey: "genero",
                  },
                  {
                    header: "Peso animal",
                    cell: (animal) =>
                      animal.biometriaAnimal?.peso
                        ? `${animal.biometriaAnimal.peso} g`
                        : "-",
                  },
                  {
                    header: "Fase de vida",
                    cell: (animal) => faseDeVidaMap[animal.faseDeVida] ?? "-",
                    accessorKey: "faseDeVida",
                  },
                  { header: "Instalação", accessorKey: "instalacaoBioterioNome" },
                  { header: "Origem", accessorKey: "localOrigemNome" },
                  {
                    header: "Situação",
                    cell: (animal) => {
                      const style: Record<string, { label: string; bg: string; text: string }> = {
                        "1": { label: "Vivo", bg: "bg-green-100", text: "text-green-700" },
                        "2": { label: "Óbito", bg: "bg-red-100", text: "text-red-700" },
                        "3": { label: "Reintroduzido", bg: "bg-yellow-100", text: "text-yellow-700" },
                        "Vivo": { label: "Vivo", bg: "bg-green-100", text: "text-green-700" },
                        "Óbito": { label: "Óbito", bg: "bg-red-100", text: "text-red-700" },
                        "Reintroduzido": { label: "Reintroduzido", bg: "bg-yellow-100", text: "text-yellow-700" },
                      }
                      const key = String(animal.situacao)
                      const s = style[key] ?? { label: "-", bg: "bg-gray-100", text: "text-gray-700" }
                      return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      )
                    },
                    accessorKey: "situacao",
                  },
                ]}
                serverPagination={{
                  page,
                  pageSize,
                  totalCount,
                  onPageChange: setPage,
                  onPageSizeChange: (size) => {
                    setPageSize(size)
                    setPage(1)
                  },
                }}
              />
            )}
          </div>
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
