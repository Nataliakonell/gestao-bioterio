import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Loader2, Calendar, ArrowLeftRight, LogIn, LogOut, Clock, User, Compass, CalendarDays } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { HorizontalCard } from "@/components/horizontal-card"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import {
    movimentacaoAnimalService,
    type MovimentacaoAnimalListVm,
    TipoMovimentacao,
} from "@/services/MovimentacaoAnimalService"
import { localizacaoService, type LocalizacaoListVm } from "@/services/LocalizacaoService"
import { eventoService, type EventoListVm, isTipoInterno } from "@/services/EventoService"

interface AbaMovimentacoesProps {
    animalId: number
    dataEntrada?: string | null
}

interface TimelineMovimentacaoItem {
    id: string | number
    tipo: "Entrada" | "Transferencia" | "SaidaEvento" | "RetornoEvento"
    tipoLabel: string
    dataHora: string
    dataTexto: string
    responsavel?: string
    descricao: ReactNode
    descricaoTextoBusca: string
    badgeColor: string
    leftBorderColor: string
    markerColor: string
    markerIcon: "login" | "logout" | "transferencia" | "evento"
}

export function AbaMovimentacoes({ animalId, dataEntrada }: AbaMovimentacoesProps) {
    const [loading, setLoading] = useState(true)
    const [movimentacoes, setMovimentacoes] = useState<MovimentacaoAnimalListVm[]>([])
    const [localizacoes, setLocalizacoes] = useState<LocalizacaoListVm[]>([])
    const [eventos, setEventos] = useState<EventoListVm[]>([])

    // Filtros
    const [search, setSearch] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [selectedTipos, setSelectedTipos] = useState<string[]>([])
    const [sortField, setSortField] = useState<string>("data")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null)

    useEffect(() => {
        const el = document.getElementById("tab-header-actions")
        setHeaderContainer(el)
    }, [])

    const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return "—"
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (match) {
            const [, y, m, d] = match
            return `${d}/${m}/${y}`
        }
        const dt = new Date(dateStr)
        if (isNaN(dt.getTime())) return "—"
        return dt.toLocaleDateString("pt-BR")
    }

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [movsRes, locsRes, evtsRes] = await Promise.all([
                movimentacaoAnimalService.getAll(animalId).catch(() => []),
                localizacaoService.getAll().catch(() => []),
                eventoService.getAll().catch(() => []),
            ])
            setMovimentacoes(movsRes || [])
            setLocalizacoes(locsRes || [])
            setEventos(evtsRes || [])
        } catch (error) {
            console.error("Erro ao carregar movimentações do animal:", error)
        } finally {
            setLoading(false)
        }
    }, [animalId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Monta a timeline com Entrada + Transferências + Eventos (Saída e Retorno)
    const timelineItems = useMemo(() => {
        const items: TimelineMovimentacaoItem[] = []

        // Mapeia localizações e eventos por ID
        const locMap = new Map<number, LocalizacaoListVm>()
        localizacoes.forEach((loc) => locMap.set(loc.id, loc))

        const evtMap = new Map<number, EventoListVm>()
        eventos.forEach((evt) => evtMap.set(evt.id, evt))

        // Ordena movimentações em ordem cronológica ascendente para calcular de onde veio e para onde foi
        const sortedAsc = [...movimentacoes].sort(
            (a, b) => new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime()
        )

        // 1. Registro de Entrada (baseado em dataEntrada do animal ou primeira data)
        const dataEntradaStr = dataEntrada || (sortedAsc.length > 0 ? sortedAsc[0].dataCriacao : new Date().toISOString())
        items.push({
            id: "entrada-inicial",
            tipo: "Entrada",
            tipoLabel: "Entrada",
            dataHora: dataEntradaStr,
            dataTexto: formatDate(dataEntradaStr),
            responsavel: undefined,
            descricao: (
                <span className="text-xs text-slate-600">
                    Primeiro registro de entrada do animal no Biotério (situado no <strong>Ambulatório</strong>).
                </span>
            ),
            descricaoTextoBusca: "Primeiro registro de entrada do animal no Biotério (situado no Ambulatório).",
            badgeColor: "bg-amber-100 text-amber-800",
            leftBorderColor: "border-l-amber-500",
            markerColor: "bg-amber-500",
            markerIcon: "login",
        })

        // 2. Registros de Movimentação (Transferência, Saída de Evento, Retorno de Evento)
        let localAnteriorNome = "Ambulatório"

        sortedAsc.forEach((mov) => {
            const destinoLoc = locMap.get(mov.localizacaoId)
            let destinoNome = destinoLoc?.nome || mov.localizacaoNome || `Sala #${mov.localizacaoId}`
            if (destinoNome.trim().toLowerCase() === "string") {
                destinoNome = "Ambulatório Central"
            }

            let origemNome = localAnteriorNome
            if (origemNome.trim().toLowerCase() === "string") {
                origemNome = "Ambulatório Central"
            }

            const eventoAssociado = mov.eventoId ? evtMap.get(mov.eventoId) : undefined
            const eventoNome = eventoAssociado?.nome || (mov.eventoId ? `Evento #${mov.eventoId}` : "Evento")

            if (mov.tipoMovimentacao === TipoMovimentacao.SaidaEvento) {
                const isInterno = eventoAssociado ? isTipoInterno(eventoAssociado.tipoEvento) : true
                const tipoLabel = isInterno ? "Saída para evento interno" : "Saída para evento externo"

                const dataPrevistaStr = eventoAssociado?.dataHoraPrevisaoRetorno
                    ? formatDate(eventoAssociado.dataHoraPrevisaoRetorno)
                    : "—"
                const descText = `${eventoNome} – Previsão de retorno: ${dataPrevistaStr}`

                items.push({
                    id: mov.id,
                    tipo: "SaidaEvento",
                    tipoLabel,
                    dataHora: mov.dataCriacao,
                    dataTexto: formatDate(mov.dataCriacao),
                    responsavel: mov.rf || undefined,
                    descricao: (
                        <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                            <span>
                                Participação no evento <strong>{eventoNome}</strong>
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Previsão de retorno ao biotério: <strong>{dataPrevistaStr}</strong>
                            </span>
                        </div>
                    ),
                    descricaoTextoBusca: descText,
                    badgeColor: "bg-amber-100 text-amber-800",
                    leftBorderColor: "border-l-amber-500",
                    markerColor: "bg-amber-600",
                    markerIcon: "logout",
                })
            } else if (mov.tipoMovimentacao === TipoMovimentacao.RetornoEvento) {
                const descText = `Retorno do evento ${eventoNome}`

                items.push({
                    id: mov.id,
                    tipo: "RetornoEvento",
                    tipoLabel: "Retorno de evento",
                    dataHora: mov.dataCriacao,
                    dataTexto: formatDate(mov.dataCriacao),
                    responsavel: mov.rf || undefined,
                    descricao: (
                        <span className="text-xs text-slate-600">
                            Retorno do evento <strong>{eventoNome}</strong>
                        </span>
                    ),
                    descricaoTextoBusca: descText,
                    badgeColor: "bg-emerald-100 text-emerald-800",
                    leftBorderColor: "border-l-emerald-500",
                    markerColor: "bg-emerald-600",
                    markerIcon: "login",
                })
            } else {
                // Transferência regular entre recintos
                const descText = `Transferência de recinto`

                items.push({
                    id: mov.id,
                    tipo: "Transferencia",
                    tipoLabel: "Transferência",
                    dataHora: mov.dataCriacao,
                    dataTexto: formatDate(mov.dataCriacao),
                    responsavel: mov.rf || undefined,
                    descricao: (
                        <span className="text-xs text-slate-600">
                            Transferência para o recinto <strong>{destinoNome}</strong>
                        </span>
                    ),
                    descricaoTextoBusca: descText,
                    badgeColor: "bg-green-100 text-green-800",
                    leftBorderColor: "border-l-green-500",
                    markerColor: "bg-green-600",
                    markerIcon: "transferencia",
                })
            }

            localAnteriorNome = destinoNome
        })

        return items
    }, [movimentacoes, localizacoes, eventos, dataEntrada])

    // Filtragem e ordenação
    const filteredItems = useMemo(() => {
        let result = timelineItems.filter((item) => {
            // Busca textual
            if (search.trim()) {
                const term = search.trim().toLowerCase()
                const matchDesc = item.descricaoTextoBusca.toLowerCase().includes(term)
                const matchTipo = item.tipoLabel.toLowerCase().includes(term)
                const matchResp = item.responsavel?.toLowerCase().includes(term)
                if (!matchDesc && !matchTipo && !matchResp) return false
            }

            // Filtro por tipo de movimentação
            if (selectedTipos.length > 0) {
                if (!selectedTipos.includes(item.tipo)) return false
            }

            // Filtro por intervalo de datas
            if (dateRange?.from) {
                const itemDate = new Date(item.dataHora)
                const from = new Date(dateRange.from)
                from.setHours(0, 0, 0, 0)
                if (itemDate < from) return false

                if (dateRange.to) {
                    const to = new Date(dateRange.to)
                    to.setHours(23, 59, 59, 999)
                    if (itemDate > to) return false
                }
            }

            return true
        })

        // Ordenação
        result.sort((a, b) => {
            const timeA = new Date(a.dataHora).getTime()
            const timeB = new Date(b.dataHora).getTime()
            return sortDirection === "asc" ? timeA - timeB : timeB - timeA
        })

        return result
    }, [timelineItems, search, selectedTipos, dateRange, sortDirection])

    // BarraDeBuscaEFiltro
    const searchFilterBar = (
        <BarraDeBuscaEFiltro
            search={search}
            onSearchChange={setSearch}
            placeholder="Pesquisar movimentações..."
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearDates={() => setDateRange(undefined)}
            sortOptions={[
                { value: "data", label: "Data da Movimentação" },
            ]}
            sortField={sortField}
            onSortFieldChange={setSortField}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            filterSections={[
                {
                    key: "tipo",
                    label: "Tipo de Movimentação",
                    type: "checkbox",
                    options: [
                        { value: "Entrada", label: "Entrada" },
                        { value: "Transferencia", label: "Transferência" },
                        { value: "SaidaEvento", label: "Saída para Evento" },
                        { value: "RetornoEvento", label: "Retorno de Evento" },
                    ],
                    selected: selectedTipos,
                    onChange: setSelectedTipos,
                },
            ]}
        />
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {headerContainer ? (
                createPortal(searchFilterBar, headerContainer)
            ) : (
                <div className="flex justify-end w-full">{searchFilterBar}</div>
            )}

            <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-slate-800">Timeline completa</h3>

                {filteredItems.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center gap-3">
                        <Clock className="h-10 w-10 text-slate-300" />
                        <p>Nenhuma movimentação encontrada para este animal.</p>
                    </div>
                ) : (
                    <div className="relative pl-10 pt-2 pb-4">
                        {/* Linha vertical cinza contínua */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200" />

                        <div className="flex flex-col gap-4">
                            {filteredItems.map((item) => {
                                return (
                                    <div key={item.id} className="relative group">
                                        {/* Marcador circular alinhado */}
                                        <div
                                            className={`absolute -left-[37px] top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110 ${item.markerColor}`}
                                        >
                                            {item.markerIcon === "login" && (
                                                <LogIn className="h-3.5 w-3.5 text-white" />
                                            )}
                                            {item.markerIcon === "logout" && (
                                                <LogOut className="h-3.5 w-3.5 text-white" />
                                            )}
                                            {item.markerIcon === "transferencia" && (
                                                <ArrowLeftRight className="h-3.5 w-3.5 text-white" />
                                            )}
                                            {item.markerIcon === "evento" && (
                                                <CalendarDays className="h-3.5 w-3.5 text-white" />
                                            )}
                                        </div>

                                        {/* Card */}
                                        <HorizontalCard
                                            leftBorderClass={item.leftBorderColor}
                                            badge={
                                                <span
                                                    className={`inline-flex items-center justify-center text-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap leading-normal ${item.badgeColor}`}
                                                >
                                                    {item.tipoLabel}
                                                </span>
                                            }
                                            title={
                                                <div className="flex flex-col gap-1 py-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{item.dataTexto}</span>
                                                    </div>
                                                    {item.responsavel && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                            <User className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>Responsável: {item.responsavel}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                            children={
                                                <div className="flex items-center">
                                                    {item.descricao}
                                                </div>
                                            }
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
