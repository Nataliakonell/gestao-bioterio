import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import { Loader2, Calendar, Check, RefreshCw, Clock, AlertCircle, User } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { HorizontalCard } from "@/components/horizontal-card"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    getProtocolosDesverminacao,
    type ProtocoloDesverminacaoListVm,
} from "@/services/ProtocoloDesverminacaoService"
import {
    getDosesAplicacaoDesverminacao,
    type DoseAplicacaoDesverminacaoListVm,
} from "@/services/DoseAplicacaoDesverminacaoService"
import { animalService } from "@/services/animalService"
import RegistrarDoseDesverminacaoModal, {
    type DoseTimelineItem,
} from "@/components/desverminacao/RegistrarDoseDesverminacaoModal"
import { usePermissions } from "@/contexts/PermissionsContext"

interface AbaDesverminacaoProps {
    animalId: number
}

export function AbaDesverminacao({ animalId }: AbaDesverminacaoProps) {
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()
    const [loading, setLoading] = useState(true)
    const [protocolo, setProtocolo] = useState<ProtocoloDesverminacaoListVm | null>(null)
    const [doses, setDoses] = useState<DoseAplicacaoDesverminacaoListVm[]>([])
    const [dataEntradaAnimal, setDataEntradaAnimal] = useState<string | null>(null)
    const [animalInfo, setAnimalInfo] = useState<{
        numeroRegistro: string
        especieNome?: string
        dataEntrada?: string | null
        situacaoAnimal?: number
    } | null>(null)

    const [search, setSearch] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [sortField, setSortField] = useState<string>("data")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null)

    useEffect(() => {
        const el = document.getElementById("tab-header-actions")
        setHeaderContainer(el)
    }, [])

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDoseItem, setSelectedDoseItem] = useState<DoseTimelineItem | null>(null)

    const handleModalClose = () => {
        setModalOpen(false)
    }

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
            const [protocolosRes, animalRes] = await Promise.all([
                getProtocolosDesverminacao().catch(() => []),
                animalService.getById(animalId).catch(() => null),
            ])

            if (animalRes) {
                setDataEntradaAnimal(animalRes.dataDeEntrada ?? null)
                setAnimalInfo({
                    numeroRegistro: animalRes.numeroRegistro,
                    especieNome: animalRes.especieNome,
                    dataEntrada: animalRes.dataDeEntrada ?? null,
                    situacaoAnimal: animalRes.situacaoAnimal,
                })
            }

            const animalProto = (protocolosRes || []).find(
                (p) => Number(p.animalId) === Number(animalId)
            )

            if (animalProto) {
                setProtocolo(animalProto)
                const dosesRes = await getDosesAplicacaoDesverminacao(animalProto.id).catch(() => [])
                setDoses(dosesRes)
            } else {
                setProtocolo(null)
                setDoses([])
            }
        } catch (error) {
            console.error("Erro ao carregar histórico de desverminação:", error)
            toast.error("Erro ao carregar histórico de desverminação")
        } finally {
            setLoading(false)
        }
    }, [animalId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const timelineItems: DoseTimelineItem[] = useMemo(() => {
        const items: DoseTimelineItem[] = []

        if (protocolo || doses.length > 0) {
            const sortedDoses = [...doses].sort((a, b) => {
                const dateA = new Date(a.dataAplicacao || a.dataPrevista).getTime()
                const dateB = new Date(b.dataAplicacao || b.dataPrevista).getTime()
                return dateB - dateA
            })

            sortedDoses.forEach((d) => {
                const statusStr = String(d.statusDoseDesverminacao).toLowerCase()
                const isAplicada =
                    statusStr === "aplicada" || statusStr === "4" ||
                    statusStr.includes("aplicada")
                const isFuturo = new Date(d.dataPrevista) > new Date()
                const prevDate = new Date(d.dataPrevista)
                const hoje = new Date()
                hoje.setHours(0, 0, 0, 0)
                const prevDateZero = new Date(prevDate)
                prevDateZero.setHours(0, 0, 0, 0)

                const isHoje = !isAplicada && prevDateZero.getTime() === hoje.getTime()
                const isAtrasada = !isAplicada && prevDateZero.getTime() < hoje.getTime()
                const isPendente = !isAplicada && isFuturo

                let labelDose = "Manutenção Anual"
                const rawTipo = String(d.tipoDose).toLowerCase()
                if (rawTipo.includes("primeira") || rawTipo === "1" || rawTipo === "primeiradose") {
                    labelDose = "1ª Dose"
                } else if (rawTipo.includes("segunda") || rawTipo === "2" || rawTipo === "segundadose") {
                    labelDose = "2ª Dose"
                } else if (rawTipo.includes("anual") || rawTipo === "3" || rawTipo.includes("manutencao")) {
                    labelDose = "Manutenção Anual"
                }

                if (isAplicada) {
                    items.push({
                        id: `dose_${d.id}`,
                        rawDoseId: d.id,
                        tipoDoseLabel: labelDose,
                        dataTexto: `Aplicado: ${formatDate(d.dataAplicacao ?? d.dataPrevista)}`,
                        dataOriginalIso: d.dataAplicacao ?? d.dataPrevista,
                        status: "aplicada",
                        doseData: d,
                    })
                } else if (isAtrasada) {
                    items.push({
                        id: `dose_${d.id}`,
                        rawDoseId: d.id,
                        tipoDoseLabel: labelDose,
                        dataTexto: `Atrasado — Previsto: ${formatDate(d.dataPrevista)}`,
                        dataOriginalIso: d.dataPrevista,
                        status: "atrasada",
                        doseData: d,
                    })
                } else if (isHoje) {
                    items.push({
                        id: `dose_${d.id}`,
                        rawDoseId: d.id,
                        tipoDoseLabel: labelDose,
                        dataTexto: `Agendado p/ Hoje: ${formatDate(d.dataPrevista)}`,
                        dataOriginalIso: d.dataPrevista,
                        status: "hoje",
                        doseData: d,
                    })
                } else if (isPendente) {
                    items.push({
                        id: `dose_${d.id}`,
                        rawDoseId: d.id,
                        tipoDoseLabel: labelDose,
                        dataTexto: `Próxima dose: ${formatDate(d.dataPrevista)}`,
                        dataOriginalIso: d.dataPrevista,
                        status: "pendente",
                        doseData: d,
                    })
                }
            })

            const hasNaoAplicada = items.some(
                (i) => i.status === "pendente" || i.status === "hoje" || i.status === "atrasada"
            )
            if (!hasNaoAplicada && protocolo?.dataProximaDose) {
                const stProto = String(protocolo.statusProtocolo ?? "").toLowerCase()
                let nextLabel = "Manutenção Anual"
                if (stProto.includes("segunda") || stProto.includes("aguardandosegunda") || stProto === "2") {
                    nextLabel = "2ª Dose"
                } else if (stProto.includes("primeira") || stProto.includes("aguardandoprimeira") || stProto === "1") {
                    nextLabel = "1ª Dose"
                }
                items.unshift({
                    id: `next_proto`,
                    tipoDoseLabel: nextLabel,
                    dataTexto: `Próxima dose: ${formatDate(protocolo.dataProximaDose)}`,
                    dataOriginalIso: protocolo.dataProximaDose,
                    status: "pendente",
                })
            }
        }

        return items
    }, [protocolo, doses])

    const filteredItems = useMemo(() => {
        return timelineItems
            .filter((item) => {
                if (dateRange?.from) {
                    const from = new Date(dateRange.from)
                    from.setHours(0, 0, 0, 0)
                    const itemDate = item.dataOriginalIso ? new Date(item.dataOriginalIso) : null
                    if (!itemDate || itemDate < from) return false

                    if (dateRange.to) {
                        const to = new Date(dateRange.to)
                        to.setHours(23, 59, 59, 999)
                        if (itemDate > to) return false
                    }
                }

                if (selectedStatus.length > 0 && !selectedStatus.includes(item.status)) {
                    return false
                }

                if (search.trim()) {
                    const term = search.toLowerCase()
                    const matches =
                        item.tipoDoseLabel.toLowerCase().includes(term) ||
                        item.dataTexto.toLowerCase().includes(term) ||
                        item.status.toLowerCase().includes(term)
                    if (!matches) return false
                }

                return true
            })
            .sort((a, b) => {
                if (sortField === "data") {
                    const dateA = a.dataOriginalIso ? new Date(a.dataOriginalIso).getTime() : 0
                    const dateB = b.dataOriginalIso ? new Date(b.dataOriginalIso).getTime() : 0
                    return sortDirection === "asc" ? dateA - dateB : dateB - dateA
                }
                const labelA = a.tipoDoseLabel.toLowerCase()
                const labelB = b.tipoDoseLabel.toLowerCase()
                if (labelA < labelB) return sortDirection === "asc" ? -1 : 1
                if (labelA > labelB) return sortDirection === "asc" ? 1 : -1
                return 0
            })
    }, [timelineItems, dateRange, selectedStatus, search, sortField, sortDirection])

    const getItemStyle = (status: DoseTimelineItem["status"]) => {
        switch (status) {
            case "aplicada":
                return {
                    badgeColor: "bg-emerald-100 text-emerald-700",
                    leftBorderColor: "border-l-emerald-500",
                    markerColor: "bg-emerald-500 text-white",
                    markerIcon: "check" as const,
                    dateClass: "",
                }
            case "atrasada":
                return {
                    badgeColor: "bg-red-100 text-red-700",
                    leftBorderColor: "border-l-red-500",
                    markerColor: "bg-red-500 text-white",
                    markerIcon: "clock" as const,
                    dateClass: "text-red-600 font-semibold",
                }
            case "hoje":
                return {
                    badgeColor: "bg-blue-100 text-blue-700",
                    leftBorderColor: "border-l-blue-500",
                    markerColor: "bg-blue-600 text-white",
                    markerIcon: "alert" as const,
                    dateClass: "text-blue-700 font-semibold",
                }
            case "pendente":
            default:
                return {
                    badgeColor: "bg-emerald-100 text-emerald-700",
                    leftBorderColor: "border-l-emerald-500",
                    markerColor: "bg-blue-600 text-white",
                    markerIcon: "refresh" as const,
                    dateClass: "text-blue-700 font-semibold",
                }
        }
    }

    const dataInicioProto = protocolo?.dataEntrada || dataEntradaAnimal
    const ultimaDoseAplicadaItem = timelineItems.find((i) => i.status === "aplicada")
    const ultimaDoseTexto = ultimaDoseAplicadaItem
        ? formatDate(ultimaDoseAplicadaItem.dataOriginalIso)
        : "—"

    let statusAtualBadge = { label: "Manutenção Anual", color: "bg-emerald-100 text-emerald-700" }

    if (protocolo) {
        const statusStr = String(protocolo.statusProtocolo).toLowerCase()
        if (statusStr.includes("primeira") || statusStr.includes("aguardando1") || statusStr === "1") {
            statusAtualBadge = { label: "Aguardando 1ª dose", color: "bg-amber-100 text-amber-700" }
        } else if (statusStr.includes("segunda") || statusStr.includes("aguardando2") || statusStr === "2") {
            statusAtualBadge = { label: "Aguardando 2ª dose", color: "bg-amber-100 text-amber-700" }
        } else if (statusStr.includes("atrasad") || statusStr === "4") {
            statusAtualBadge = { label: "Atrasado", color: "bg-red-100 text-red-700" }
        } else if (statusStr.includes("concluido") || statusStr === "5") {
            statusAtualBadge = { label: "Ciclo Concluído", color: "bg-green-100 text-green-700" }
        }
    } else if (timelineItems.length > 0) {
        statusAtualBadge = { label: "Manutenção Anual", color: "bg-emerald-100 text-emerald-700" }
    } else {
        statusAtualBadge = { label: "Não iniciado", color: "bg-slate-100 text-slate-700" }
    }

    const isAnimalInativo = animalInfo?.situacaoAnimal && animalInfo.situacaoAnimal !== 1
        ? (animalInfo.situacaoAnimal === 2 ? "Óbito" : "Reintroduzido")
        : null

    const openModal = (item: DoseTimelineItem | null) => {
        if (isAnimalInativo) {
            toast.warning(`Não é permitido registrar doses de desverminação para animal em ${isAnimalInativo}.`)
            return
        }
        setSelectedDoseItem(item)
        setModalOpen(true)
    }

    const searchFilterBar = (
        <BarraDeBuscaEFiltro
            search={search}
            onSearchChange={setSearch}
            placeholder="Buscar por dose, data, status..."
            filterSections={[
                {
                    key: "sort",
                    label: "Ordenar por",
                    type: "radio",
                    options: [
                        { value: "data:desc", label: "Data (mais recente)" },
                        { value: "data:asc", label: "Data (mais antiga)" },
                        { value: "dose:asc", label: "Dose (A → Z)" },
                        { value: "dose:desc", label: "Dose (Z → A)" },
                    ],
                    selectedValue: `${sortField}:${sortDirection}`,
                    onValueChange: (val) => {
                        const [field, dir] = val.split(":")
                        setSortField(field)
                        setSortDirection(dir as "asc" | "desc")
                    },
                },
                {
                    key: "data",
                    label: "Intervalo de Datas",
                    type: "dateRange",
                    dateRange: dateRange,
                    onDateRangeChange: setDateRange,
                },
                {
                    key: "status",
                    label: "Status da Dose",
                    type: "checkbox",
                    options: [
                        { value: "aplicada", label: "Aplicada" },
                        { value: "pendente", label: "Próxima Dose / Pendente" },
                        { value: "hoje", label: "Agendado para Hoje" },
                        { value: "atrasada", label: "Atrasada" },
                    ],
                    selected: selectedStatus,
                    onChange: setSelectedStatus,
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Timeline Esquerda */}
                <div className="lg:col-span-8">
                    {timelineItems.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center gap-3">
                            <Clock className="h-10 w-10 text-slate-300" />
                            <p>Nenhum registro de desverminação encontrado para este animal.</p>
                            {hasPermission("Desverminacao", "Gerenciar") && !isAnimalInativo && (
                                <Button
                                    onClick={() => navigate(`/desverminacao/registrar-dose?animalId=${animalId}`)}
                                    variant="outline"
                                    className="mt-2 text-blue-800 border-blue-200 hover:bg-blue-50"
                                >
                                    Iniciar Protocolo de Desverminação
                                </Button>
                            )}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center gap-3">
                            <Clock className="h-10 w-10 text-slate-300" />
                            <p>Nenhum registro encontrado para os filtros selecionados.</p>
                        </div>
                    ) : (
                        <div className="relative pl-10 pt-2 pb-4">
                            {/* Linha vertical cinza contínua */}
                            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200" />

                            <div className="flex flex-col gap-4">
                                {filteredItems.map((item) => {
                                    const style = getItemStyle(item.status)
                                    return (
                                        <div key={item.id} className="relative group">
                                            {/* Marcador circular */}
                                            <div
                                                className={`absolute -left-[37px] top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-110 ${style.markerColor}`}
                                            >
                                                {style.markerIcon === "check" && <Check className="h-4 w-4 text-white" />}
                                                {style.markerIcon === "refresh" && <RefreshCw className="h-3.5 w-3.5 text-white" />}
                                                {style.markerIcon === "clock" && <Clock className="h-3.5 w-3.5 text-white" />}
                                                {style.markerIcon === "alert" && <AlertCircle className="h-3.5 w-3.5 text-white" />}
                                            </div>

                                            {/* Card */}
                                            <HorizontalCard
                                                leftBorderClass={style.leftBorderColor}
                                                badge={
                                                    <span className={`inline-flex items-center justify-center text-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap leading-normal ${style.badgeColor}`}>
                                                        {item.tipoDoseLabel}
                                                    </span>
                                                }
                                                title={
                                                    <div className="flex flex-col gap-1 py-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className={style.dateClass || ""}>
                                                                {item.dataTexto}
                                                            </span>
                                                        </div>
                                                        {item.doseData?.responsavel && (
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                                <User className="h-3.5 w-3.5 text-slate-400" />
                                                                <span>Profissional: {item.doseData.responsavel}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                                onClick={hasPermission("Desverminacao", "Editar") ? () => openModal(item) : undefined}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Resumo do Protocolo à Direita */}
                <div className="lg:col-span-4 sticky top-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                            Resumo do protocolo
                        </h3>

                        <div className="flex flex-col gap-3.5 text-xs text-gray-600">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Protocolo iniciado em:</span>
                                <strong className="font-semibold text-gray-900">
                                    {formatDate(dataInicioProto)}
                                </strong>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Última dose aplicada:</span>
                                <strong className="font-semibold text-gray-900">
                                    {ultimaDoseTexto}
                                </strong>
                            </div>

                            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                                <span className="text-gray-500">Status atual:</span>
                                <span className={`inline-flex items-center justify-center text-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap leading-normal ${statusAtualBadge.color}`}>
                                    {statusAtualBadge.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Registro */}
            {modalOpen && animalInfo && (
                <RegistrarDoseDesverminacaoModal
                    open={modalOpen}
                    onClose={handleModalClose}
                    doseItem={selectedDoseItem}
                    protocolo={protocolo}
                    animal={{
                        id: animalId,
                        numeroRegistro: animalInfo.numeroRegistro,
                        especieNome: animalInfo.especieNome,
                        dataEntrada: animalInfo.dataEntrada,
                    }}
                    onSuccess={() => {
                        handleModalClose()
                        fetchData()
                    }}
                />
            )}
        </div>
    )
}
