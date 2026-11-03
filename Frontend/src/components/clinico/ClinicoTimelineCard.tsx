import { useState } from "react"
import { Calendar, User, FileText, ExternalLink, Pause, AlertTriangle } from "lucide-react"
import { usePermissions } from "@/contexts/PermissionsContext"

export interface ClinicoTimelineItem {
    key: string
    id: number
    tipo: string
    label: string
    status?: string
    dataHora: string
    dataCriacao?: string
    responsavel?: string
    detalhesText?: string
    anamnese?: string
    evolucaoDesc?: string
    procedimentoDesc?: string
    borderColor: string
    badgeColor: string
    nodeBorder: string
    markerStyle: { bg: string; border: string; text: string; icon: any }
    count?: number
    isStandalone?: boolean
    prescricaoRaw?: import("@/services/PrescricaoMedicacaoService").PrescricaoMedicacaoListVm
    exameGroup?: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]
    onClick: () => void
}

function ExpandableText({
    text,
    prefix,
    maxChars = 220,
    className = "",
    isSuspensa = false,
}: {
    text: string
    prefix?: string
    maxChars?: number
    className?: string
    isSuspensa?: boolean
}) {
    const [expanded, setExpanded] = useState(false)

    if (!text) return null

    const fullText = text
    const shouldTruncate = fullText.length > maxChars
    const displayText = expanded || !shouldTruncate ? fullText : `${fullText.slice(0, maxChars)}...`
    const { hasPermission } = usePermissions()


    if (isSuspensa) {
        return (
            <div className="flex flex-col gap-1">
                {prefix && (
                    <span className="text-xs font-bold text-slate-900">{prefix}:</span>
                )}
                <span className="line-through decoration-red-400 decoration-[1px] text-xs text-red-800">{displayText}</span>
                {shouldTruncate && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setExpanded(!expanded)
                        }}
                        className="inline-block text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline ml-1 cursor-pointer select-none"
                    >
                        {expanded ? "ver menos" : "ver mais..."}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className={`text-xs text-slate-700 leading-relaxed ${className}`}>
            {prefix && <span className="font-bold text-slate-900">{prefix}: </span>}
            <span>{displayText} </span>
            {shouldTruncate && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        setExpanded(!expanded)
                    }}
                    className="inline-block text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline ml-1 cursor-pointer select-none"
                >
                    {expanded ? "ver menos" : "ver mais..."}
                </button>
            )}
        </div>
    )
}

interface ClinicoTimelineCardProps {
    item: ClinicoTimelineItem
    isLast: boolean
    getGrupoStatus: (group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]) => "Ativa" | "Suspensa" | "Cancelada"
    handleOpenDocumento: (tipo: any, atendimentoId: number, solicitacoesGroup?: any) => void
    handleEditDocumento: (tipo: any, id: number) => void
    handleOpenExameDocumento: (group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]) => void
    setExameSuspensaoModal: (data: { group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[] } | null) => void
}

export function ClinicoTimelineCard({
    item,
    isLast,
    getGrupoStatus,
    handleOpenDocumento,
    handleEditDocumento,
    handleOpenExameDocumento,
    setExameSuspensaoModal,
}: ClinicoTimelineCardProps) {
    const { hasPermission } = usePermissions()
    const Icon = item.markerStyle.icon

    const dateObj = item.dataHora ? new Date(item.dataHora) : null
    const dateFormatted = dateObj && !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("pt-BR")
        : "-"
    const shouldHideTime = item.tipo === "AltaAmbulatorial" || item.tipo === "LiberacaoQuarentena"
    const timeFormatted = dateObj && !isNaN(dateObj.getTime()) && item.dataHora.includes("T") && !shouldHideTime
        ? dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        : null

    const dataHoraLabel = timeFormatted
        ? `${dateFormatted} às ${timeFormatted}`
        : dateFormatted

    const prefix = item.tipo === "PrescricaoMedicacao"
        ? "Detalhes"
        : item.tipo === "Evolucao"
            ? "Evolução"
            : item.tipo === "Procedimento"
                ? "Procedimento"
                : item.tipo === "Exame"
                    ? "Solicitação de exame"
                    : item.tipo === "Consulta"
                        ? "Consulta"
                        : item.tipo === "AltaAmbulatorial"
                            ? "Alta"
                            : item.tipo === "LiberacaoQuarentena"
                                ? "Liberação"
                                : item.label

    const textoCorpo = item.evolucaoDesc || item.procedimentoDesc || item.anamnese || item.detalhesText || ""
    const count = item.count ?? (item.exameGroup ? item.exameGroup.length : (item.tipo === "Procedimento" || item.tipo === "PrescricaoMedicacao" || item.tipo === "Exame" ? 1 : undefined))

    return (
        <div className="group relative flex items-start gap-4">
            <div className="relative flex flex-col items-center self-stretch">
                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border-2 ${item.nodeBorder} shadow-xs ring-4 ring-white z-10 transition-transform duration-300 group-hover:scale-105`}
                >
                    <Icon className="h-4 w-4 stroke-[2.3]" />
                </div>
                {!isLast && (
                    <div className="w-0.5 grow bg-slate-200 my-1 transition-colors duration-300 group-hover:bg-slate-300" />
                )}
            </div>

            <div
                onClick={item.onClick}
                className={`relative mb-6 flex-1 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer ${item.borderColor}`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{dataHoraLabel}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span>Profissional: {item.responsavel || "Profissional Responsável"}</span>
                        </div>
                    </div>

                    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold shrink-0 ${item.badgeColor}`}>
                        {item.tipo === "PrescricaoMedicacao" && item.status === "Suspensa" ? "Prescrição suspensa" : item.label}
                    </span>
                </div>

                {textoCorpo && (
                    <div className="mt-3.5">
                        <ExpandableText text={textoCorpo} prefix={prefix} maxChars={220} isSuspensa={item.tipo === "PrescricaoMedicacao" && item.status === "Suspensa"} />
                    </div>
                )}

                {item.tipo === "Exame" && item.exameGroup && (() => {
                    const st = getGrupoStatus(item.exameGroup)
                    const isAtiva = st === "Ativa"
                    const isSuspensa = st === "Suspensa"
                    const primeiro = item.exameGroup[0]
                    const motivoSusp = primeiro.observacao?.includes("|||SUSPENSO_MOTIVO|||")
                        ? primeiro.observacao.split("|||SUSPENSO_MOTIVO|||")[1]?.split("|||")[0]
                        : undefined
                    const dataSusp = primeiro.observacao?.includes("|||SUSPENSO_DATA|||")
                        ? primeiro.observacao.split("|||SUSPENSO_DATA|||")[1]?.split("|||")[0]
                        : undefined

                    return (
                        <div className="">
                            {isSuspensa && (
                                <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] text-orange-900">
                                    <div className="flex items-center gap-1.5 font-semibold">
                                        <AlertTriangle className="h-3.5 w-3.5" /> Solicitação suspensa {dataSusp ? `em ${new Date(dataSusp).toLocaleDateString("pt-BR")}` : ""}
                                    </div>
                                    {motivoSusp && <div className="mt-1"><span className="font-medium">Motivo:</span> {motivoSusp}</div>}
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenExameDocumento(item.exameGroup!) }} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-orange-700 hover:text-orange-900 underline">
                                        Ver documento
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })()}
            </div>
        </div>
    )
}
