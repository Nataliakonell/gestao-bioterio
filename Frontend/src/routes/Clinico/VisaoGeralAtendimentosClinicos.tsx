import { formatarLocalizacao } from "@/lib/utils";
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { HorizontalCard } from "@/components/horizontal-card"
import { PaginationBar } from "@/components/pagination-bar"
import {
    consultaService,
    type VisaoGeralClinicaItemVm,
    type VisaoGeralClinicaResponse
} from "@/services/ConsultaService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { type DateRange } from "react-day-picker"
import {
    Stethoscope,
    FlaskConical,
    Pill,
    FileText,
    Scissors,
    Paperclip,
    UserCheck,
    ShieldCheck,
    Skull,
    Clock,
    Sparkles,
    Activity,
    Loader2
} from "lucide-react"

const categoriaBadgeStyle: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    Consulta: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-l-emerald-600", icon: Stethoscope },
    AltaAmbulatorial: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-l-emerald-500", icon: UserCheck },
    LiberacaoQuarentena: { bg: "bg-blue-50", text: "text-blue-700", border: "border-l-blue-600", icon: ShieldCheck },
    RegistroObito: { bg: "bg-red-50", text: "text-red-700", border: "border-l-red-600", icon: Skull },
    SolicitacaoExame: { bg: "bg-amber-50", text: "text-amber-700", border: "border-l-amber-500", icon: FlaskConical },
    Evolucao: { bg: "bg-purple-50", text: "text-purple-700", border: "border-l-purple-500", icon: FileText },
    Procedimento: { bg: "bg-sky-50", text: "text-sky-700", border: "border-l-sky-500", icon: Scissors },
    Anexo: { bg: "bg-slate-50", text: "text-slate-700", border: "border-l-slate-500", icon: Paperclip },
    PrescricaoMedicacao: { bg: "bg-teal-50", text: "text-teal-700", border: "border-l-teal-600", icon: Pill },
}

function formatDataAmigavel(isoDate: string): string {
    if (!isoDate) return "-"
    const d = new Date(isoDate)
    const agora = new Date()
    const diffMs = agora.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHoras = Math.floor(diffMin / 60)
    const diffDias = Math.floor(diffHoras / 24)

    const horaStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    if (diffDias === 0) {
        if (diffMin < 2) return "Agora mesmo"
        if (diffMin < 60) return `Há ${diffMin} min`
        return `Hoje às ${horaStr}`
    }
    if (diffDias === 1) return `Ontem às ${horaStr}`
    if (diffDias < 7) return `Há ${diffDias} dias atrás`
    return d.toLocaleDateString("pt-BR")
}

export default function VisaoGeralAtendimentosClinicos() {
    const navigate = useNavigate()
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedEspecie, setSelectedEspecie] = useState<string>("")
    const [selectedTipo, setSelectedTipo] = useState<string>("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()

    const [allEspecies, setAllEspecies] = useState<EspecieLookupVm[]>([])
    const [data, setData] = useState<VisaoGeralClinicaResponse | null>(null)
    const [loading, setLoading] = useState(true)

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        especieService.getLookup().then(setAllEspecies).catch(console.error)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchInput])

    const formatDateParam = (d?: Date) => {
        if (!d) return undefined
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await consultaService.getVisaoGeral({
                page,
                pageSize,
                search: searchTerm || undefined,
                especieId: selectedEspecie ? Number(selectedEspecie) : undefined,
                tipoAtendimento: selectedTipo || undefined,
                dataInicio: formatDateParam(dateRange?.from),
                dataFim: formatDateParam(dateRange?.to),
            })
            setData(res)
        } catch (error) {
            console.error("Erro ao carregar visão geral clínica:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [page, pageSize, searchTerm, selectedEspecie, selectedTipo, dateRange])

    const handleCardClick = (item: VisaoGeralClinicaItemVm) => {
        navigate(`/plantel/animal/${item.animalId}?tab=clinico`)
    }

    const tiposOptions = [
        { label: "Consulta", value: "Consulta" },
        { label: "Prescrição de Medicação", value: "PrescricaoMedicacao" },
        { label: "Evolução Clínica", value: "Evolucao" },
        { label: "Procedimento", value: "Procedimento" },
        { label: "Solicitação de Exame", value: "SolicitacaoExame" },
        { label: "Alta Ambulatorial", value: "AltaAmbulatorial" },
        { label: "Liberação de Quarentena", value: "LiberacaoQuarentena" },
        { label: "Registro de Óbito", value: "RegistroObito" },
        { label: "Anexo", value: "Anexo" },
    ]

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Atendimentos Clínicos"
                            breadcrumbUrl="/clinico/atendimentos"
                        />
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">

                        {/* Barra de Busca e Filtro alinhada à direita padrão */}
                        <div className="flex justify-end w-full">
                            <BarraDeBuscaEFiltro
                                search={searchInput}
                                onSearchChange={setSearchInput}
                                placeholder="Buscar registro, espécie, responsável..."
                                filterSections={[
                                    {
                                        key: "tipoAtendimento",
                                        label: "Tipo de Atendimento",
                                        type: "select",
                                        options: tiposOptions,
                                        selectedValue: selectedTipo,
                                        onValueChange: (val) => {
                                            setSelectedTipo(val)
                                            setPage(1)
                                        },
                                    },
                                    {
                                        key: "especie",
                                        label: "Espécie",
                                        type: "select",
                                        options: allEspecies.map((esp) => ({
                                            value: String(esp.id),
                                            label: esp.nome,
                                        })),
                                        selectedValue: selectedEspecie,
                                        onValueChange: (val) => {
                                            setSelectedEspecie(val)
                                            setPage(1)
                                        },
                                    },
                                    {
                                        key: "periodo",
                                        label: "Período",
                                        type: "dateRange",
                                        dateRange: dateRange,
                                        onDateRangeChange: (range) => {
                                            setDateRange(range)
                                            setPage(1)
                                        },
                                    },
                                ]}
                            />
                        </div>

                        {/* Lista de Horizontal Cards */}
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : data?.items && data.items.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {data.items.map((item, index) => {
                                    const ultimo = item.ultimoAtendimento
                                    const style = ultimo?.tipo ? (categoriaBadgeStyle[ultimo.tipo] ?? categoriaBadgeStyle.Consulta) : categoriaBadgeStyle.Consulta
                                    const Icon = style.icon

                                    const infoBlocks = [
                                        {
                                            label: "Data / Hora",
                                            value: ultimo ? formatDataAmigavel(ultimo.dataHora) : "-",
                                        },
                                        {
                                            label: "Responsável",
                                            value: ultimo?.responsavel || "-",
                                        },
                                    ]

                                    const isMostRecent = index === 0 && page === 1 && !searchTerm && !selectedTipo && !selectedEspecie

                                    return (
                                        <HorizontalCard
                                            key={item.animalId}
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <span>{item.especieNome}</span>
                                                    {isMostRecent && (
                                                        <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                                                            Mais recente
                                                        </span>
                                                    )}
                                                </div>
                                            }
                                            subtitle={`#${item.numeroRegistro} · ${formatarLocalizacao(item.localizacao)} · ${item.faseDeVidaNome}`}
                                            badge={
                                                ultimo ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
                                                        <Icon className="h-3 w-3" />
                                                        {ultimo.tipoLabel}
                                                    </span>
                                                ) : undefined
                                            }
                                            leftBorderClass={style.border}
                                            infoBlocks={infoBlocks}
                                            onClick={() => handleCardClick(item)}
                                        />
                                    )
                                })}

                                {/* Barra de Paginação */}
                                <PaginationBar
                                    currentPage={page}
                                    pageSize={pageSize}
                                    totalCount={data.totalCount}
                                    onPageChange={setPage}
                                    onPageSizeChange={(newSize) => {
                                        setPageSize(newSize)
                                        setPage(1)
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200 p-8">
                                <Stethoscope className="h-10 w-10 text-gray-300 mb-2" />
                                <h3 className="text-sm font-semibold text-gray-800">Nenhum atendimento clínico encontrado</h3>
                                <p className="text-xs text-gray-500 max-w-sm mt-1">
                                    Não há registros de atendimentos clínicos com os filtros atuais selecionados.
                                </p>
                            </div>
                        )}
                    </div>
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}
