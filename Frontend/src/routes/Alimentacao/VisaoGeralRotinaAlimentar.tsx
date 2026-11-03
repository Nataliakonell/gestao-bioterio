import { useState, useEffect, useRef } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import rotinaAnimalService, { StatusRotina, type RotinaStatusSummaryVm } from "@/services/RotinaAnimalService"
import { TabelaRotinaAlimentar } from "@/components/visao-geral-rotina-especifica/RotinaAlimentar"
import { type AnimalRotinaStatusVm } from "@/services/RotinaAnimalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { StatsCard } from "@/components/stats-card"
import { type DateRange } from "react-day-picker"
import { usePermissions } from "@/contexts/PermissionsContext"

export default function VisaoGeralRotinaAlimentar() {
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Alimentação", "Editar")

    const location = useLocation()
    const initialStateStatus = location.state?.status ? [location.state.status] : []
    const [searchInput, setSearchInput] = useState("")
    const [searchRotina, setSearchRotina] = useState("")
    const [selectedEspecieRotina, setSelectedEspecieRotina] = useState<string>("")
    const [selectedStatusRotina, setSelectedStatusRotina] = useState<string[]>(initialStateStatus)
    const [selectedFaseDeVidaRotina, setSelectedFaseDeVidaRotina] = useState<string[]>([])
    const [dateRangeRotina, setDateRangeRotina] = useState<DateRange | undefined>()
    const navigate = useNavigate()

    const [allEspecies, setAllEspecies] = useState<EspecieLookupVm[]>([])

    const [rotinasData, setRotinasData] = useState<AnimalRotinaStatusVm[]>([])
    const [rotinasSummary, setRotinasSummary] = useState<RotinaStatusSummaryVm | null>(null)

    const [serverPage, setServerPage] = useState(1)
    const [serverPageSize, setServerPageSize] = useState(10)
    const [serverTotalCount, setServerTotalCount] = useState(0)

    useEffect(() => {
        especieService.getLookup().then(setAllEspecies).catch(console.error)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => setSearchRotina(searchInput), 400)
        return () => clearTimeout(timer)
    }, [searchInput])

    const formatDateParam = (d?: Date) => {
        if (!d) return undefined
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
    }

    const filterSnapshot = JSON.stringify({
        searchRotina,
        serverPageSize,
        selectedEspecieRotina,
        selectedFaseDeVidaRotina,
        selectedStatusRotina,
        dateRangeRotina,
    })

    const prevFilterRef = useRef(filterSnapshot)

    useEffect(() => {
        const fetchRotinas = async () => {
            try {
                const response = await rotinaAnimalService.getAllAnimaisRotinaStatus({
                    page: serverPage,
                    pageSize: serverPageSize,
                    search: searchRotina,
                    especieId: selectedEspecieRotina ? Number(selectedEspecieRotina) : undefined,
                    faseDeVida: selectedFaseDeVidaRotina.length > 0 ? selectedFaseDeVidaRotina.map(Number) : undefined,
                    statusAlimentacao: selectedStatusRotina.map(Number),
                    dataAlimentacaoInicial: formatDateParam(dateRangeRotina?.from),
                    dataAlimentacaoFinal: formatDateParam(dateRangeRotina?.to),
                })

                const withAlimentacao = response.items.filter(
                    (s): s is AnimalRotinaStatusVm => s.alimentacao !== undefined
                )

                setRotinasData(withAlimentacao)
                setServerTotalCount(response.totalCount)
                setRotinasSummary(response.summary)
            } catch (error) {
                console.error("Erro ao buscar status de rotinas", error)
            }
        }

        if (prevFilterRef.current !== filterSnapshot) {
            prevFilterRef.current = filterSnapshot
            if (serverPage !== 1) {
                setServerPage(1)
                return
            }
        }

        fetchRotinas()
    }, [serverPage, filterSnapshot, serverPageSize, searchRotina, selectedEspecieRotina, selectedFaseDeVidaRotina, selectedStatusRotina, dateRangeRotina])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Alimentações"
                            breadcrumbUrl="/alimentacao/visao-geral"
                            title="Escala de alimentação"
                        />
                    </HeaderContainer>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                        <StatsCard
                            label="Alimentações atrasadas"
                            value={rotinasSummary?.alimentacaoAtrasado ?? 0}
                            description="Animais com alimentação atrasada"
                            onClick={() => {
                                const val = String(StatusRotina.Atrasado)
                                setSelectedStatusRotina(prev => prev.includes(val) ? [] : [val])
                            }}
                            className={selectedStatusRotina.includes(String(StatusRotina.Atrasado)) ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                        />
                        <StatsCard
                            label="Agendadas para hoje"
                            value={rotinasSummary?.alimentacaoHoje ?? 0}
                            description="Animais para alimentar hoje"
                            onClick={() => {
                                const val = String(StatusRotina.Hoje)
                                setSelectedStatusRotina(prev => prev.includes(val) ? [] : [val])
                            }}
                            className={selectedStatusRotina.includes(String(StatusRotina.Hoje)) ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                        />
                        <StatsCard
                            label="Não alimentados"
                            value={rotinasSummary?.alimentacaoNaoAlimentado ?? 0}
                            description="Não alimentados em dia programado"
                            onClick={() => {
                                const val = String(StatusRotina.NaoAlimentado)
                                setSelectedStatusRotina(prev => prev.includes(val) ? [] : [val])
                            }}
                            className={selectedStatusRotina.includes(String(StatusRotina.NaoAlimentado)) ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                        />
                        <StatsCard
                            label="Sem registro"
                            value={rotinasSummary?.alimentacaoSemRegistro ?? 0}
                            description="Sem rotina de alimentação"
                            onClick={() => {
                                const val = String(StatusRotina.SemRegistro)
                                setSelectedStatusRotina(prev => prev.includes(val) ? [] : [val])
                            }}
                            className={selectedStatusRotina.includes(String(StatusRotina.SemRegistro)) ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex-1 w-full flex justify-end">
                            <BarraDeBuscaEFiltro
                                search={searchInput}
                                onSearchChange={setSearchInput}
                                placeholder="Buscar por espécie ou frequência..."
                                filterSections={[
                                    {
                                        key: "status",
                                        label: "Situação",
                                        type: "checkbox",
                                        options: [
                                            { value: "1", label: "Sem registro" },
                                            { value: "2", label: "Hoje" },
                                            { value: "3", label: "Próximo" },
                                            { value: "4", label: "Concluído" },
                                            { value: "5", label: "Em dia" },
                                            { value: "6", label: "Atrasado" },
                                            { value: "7", label: "Não alimentado" },
                                        ],
                                        selected: selectedStatusRotina,
                                        onChange: setSelectedStatusRotina,
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
                                        selected: selectedFaseDeVidaRotina,
                                        onChange: setSelectedFaseDeVidaRotina,
                                    },
                                    {
                                        key: "especie",
                                        label: "Espécie",
                                        type: "select",
                                        options: allEspecies.map((e) => ({
                                            value: String(e.id),
                                            label: e.nome,
                                        })),
                                        selectedValue: selectedEspecieRotina,
                                        onValueChange: setSelectedEspecieRotina,
                                    },
                                    {
                                        key: "proximaAlimentacao",
                                        label: "Data",
                                        type: "dateRange",
                                        dateRange: dateRangeRotina,
                                        onDateRangeChange: setDateRangeRotina,
                                    },
                                ]}
                            />
                        </div>

                        <div className="mt-0">
                            <TabelaRotinaAlimentar
                                search={searchInput}
                                selectedEspecie={selectedEspecieRotina}
                                selectedStatus={selectedStatusRotina}
                                dateRange={dateRangeRotina}
                                data={rotinasData}
                                serverPage={serverPage}
                                serverPageSize={serverPageSize}
                                serverTotalCount={serverTotalCount}
                                onPaginationChange={(page, size) => {
                                    setServerPage(page)
                                    setServerPageSize(size)
                                }}
                                onRowClick={
                                    canEdit
                                        ? (item) => navigate(`/plantel/animal/${item.animalId}?tab=alimentacao`)
                                        : undefined
                                }
                            />
                        </div>
                    </div>
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}
