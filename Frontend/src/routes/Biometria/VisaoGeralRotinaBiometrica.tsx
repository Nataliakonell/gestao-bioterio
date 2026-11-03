import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { usePermissions } from "@/contexts/PermissionsContext"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import rotinaAnimalService, { StatusRotina, type RotinaStatusSummaryVm } from "@/services/RotinaAnimalService"
import { TabelaRotinaBiometria } from "@/components/visao-geral-rotina-especifica/RotinaBiometria"
import { type AnimalRotinaStatusVm } from "@/services/RotinaAnimalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { StatsCard } from "@/components/stats-card"
import { type DateRange } from "react-day-picker"

export default function VisaoGeralRotinaBiometrica() {
    const location = useLocation()
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Biometria", "Editar")
    const initialStateStatus = location.state?.status ? [location.state.status] : []
    const [searchRotina, setSearchRotina] = useState("")
    const [selectedEspecieRotina, setSelectedEspecieRotina] = useState<string>("")
    const [selectedStatusRotina, setSelectedStatusRotina] = useState<string[]>(initialStateStatus)
    const [selectedFaseDeVidaRotina, setSelectedFaseDeVidaRotina] = useState<string[]>([])
    const [dateRangeRotina, setDateRangeRotina] = useState<DateRange | undefined>()
    
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
        const fetchRotinas = async () => {
            try {
                const response = await rotinaAnimalService.getAllAnimaisRotinaStatus({
                    page: serverPage,
                    pageSize: serverPageSize,
                    search: searchRotina,
                    especieId: selectedEspecieRotina ? Number(selectedEspecieRotina) : undefined,
                    faseDeVida: selectedFaseDeVidaRotina.length > 0 ? selectedFaseDeVidaRotina.map(Number) : undefined,
                    statusBiometria: selectedStatusRotina.map(Number),
                    dataBiometriaInicial: dateRangeRotina?.from?.toISOString(),
                    dataBiometriaFinal: dateRangeRotina?.to?.toISOString(),
                })

                const withBiometria = response.items.filter(
                    (s): s is AnimalRotinaStatusVm => s.biometria !== undefined
                )

                setRotinasData(withBiometria)
                setServerTotalCount(response.totalCount)
                setRotinasSummary(response.summary)
            } catch (error) {
                console.error("Erro ao buscar status de rotinas de biometria", error)
            }
        }
        fetchRotinas()
    }, [serverPage, serverPageSize, searchRotina, selectedEspecieRotina, selectedFaseDeVidaRotina, selectedStatusRotina, dateRangeRotina])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Biometrias"
                            breadcrumbUrl="/biometria"
                            title="Escala de biometria"
                        />
                    </HeaderContainer>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                        <StatsCard
                            label="Biometrias atrasadas"
                            value={rotinasSummary?.biometriaAtrasado ?? 0}
                            description="Animais com biometria atrasada"
                            onClick={() => {
                                const val = String(StatusRotina.Atrasado)
                                setSelectedStatusRotina(prev => prev.includes(val) ? [] : [val])
                            }}
                            className={selectedStatusRotina.includes(String(StatusRotina.Atrasado)) ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                        />
                        <StatsCard
                            label="Agendadas para hoje"
                            value={rotinasSummary?.biometriaHoje ?? 0}
                            description="Animais para realizar biometria hoje"
                            onClick={() => {
                                const val = String(StatusRotina.Hoje)
                                setSelectedStatusRotina(prev => prev.includes(val) ? [] : [val])
                            }}
                            className={selectedStatusRotina.includes(String(StatusRotina.Hoje)) ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                        />
                        <StatsCard
                            label="Não realizadas"
                            value={rotinasSummary?.biometriaNaoAlimentado ?? 0}
                            description="Não realizadas em dia programado"
                            onClick={() => {
                                const val = String(StatusRotina.NaoAlimentado)
                                setSelectedStatusRotina(prev => prev.includes(val) ? [] : [val])
                            }}
                            className={selectedStatusRotina.includes(String(StatusRotina.NaoAlimentado)) ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                        />
                        <StatsCard
                            label="Sem registro"
                            value={rotinasSummary?.biometriaSemRegistro ?? 0}
                            description="Sem rotina de biometria"
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
                                search={searchRotina}
                                onSearchChange={setSearchRotina}
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
                                            { value: "7", label: "Não realizado" },
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
                                        key: "proximaBiometria",
                                        label: "Data",
                                        type: "dateRange",
                                        dateRange: dateRangeRotina,
                                        onDateRangeChange: setDateRangeRotina,
                                    },
                                ]}
                            />
                        </div>

                        <div className="mt-0">
                            <TabelaRotinaBiometria
                                search={searchRotina}
                                selectedEspecie={selectedEspecieRotina}
                                onEspeciesLoad={() => {}}
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
                                        ? (item) => navigate(`/plantel/animal/${item.animalId}?tab=biometria`)
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
