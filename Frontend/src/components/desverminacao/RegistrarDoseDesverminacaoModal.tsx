import { useState } from "react"
import { X, Check, AlertTriangle, CheckCircle2, RefreshCw, Clock, AlertCircle, User, Calendar, FileText } from "lucide-react"
import { toast } from "sonner"
import { getUserInfo } from "@/services/api"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import {
    createDoseAplicacaoDesverminacao,
    updateDoseAplicacaoDesverminacao,
    deleteDoseAplicacaoDesverminacao,
    StatusDoseDesverminacao,
    TipoDose,
    type DoseAplicacaoDesverminacaoListVm,
} from "@/services/DoseAplicacaoDesverminacaoService"
import {
    createProtocoloDesverminacao,
    type ProtocoloDesverminacaoListVm,
} from "@/services/ProtocoloDesverminacaoService"


const padZ = (n: number) => String(n).padStart(2, "0")

const localIsoNow = () => {
    const d = new Date()
    return `${d.getFullYear()}-${padZ(d.getMonth() + 1)}-${padZ(d.getDate())}T${padZ(d.getHours())}:${padZ(d.getMinutes())}`
}

const toLocalIso = (isoString: string) => {
    const d = new Date(isoString)
    return `${d.getFullYear()}-${padZ(d.getMonth() + 1)}-${padZ(d.getDate())}T${padZ(d.getHours())}:${padZ(d.getMinutes())}`
}

const formatDateTime = (isoString: string) =>
    new Date(isoString).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })

const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return "—"
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
        const [, y, m, d] = match
        return `${d}/${m}/${y}`
    }
    const dt = new Date(isoString)
    if (isNaN(dt.getTime())) return "—"
    return dt.toLocaleDateString("pt-BR")
}

const parseTipoDoseToEnum = (tipoDose: string | number | undefined | null): TipoDose => {
    if (tipoDose === undefined || tipoDose === null) return TipoDose.PrimeiraDose
    if (typeof tipoDose === "number") return tipoDose as TipoDose
    const raw = String(tipoDose).toLowerCase()
    if (raw.includes("primeira") || raw === "1" || raw === "primeiradose") return TipoDose.PrimeiraDose
    if (raw.includes("segunda") || raw === "2" || raw === "segundadose") return TipoDose.SegundaDose
    if (raw.includes("anual") || raw === "3" || raw.includes("manutencao") || raw.includes("manutenção")) return TipoDose.Anual
    const parsed = parseInt(raw)
    return isNaN(parsed) ? TipoDose.PrimeiraDose : (parsed as TipoDose)
}

const tipoDoseLabel = (tipoDose: string | number): string => {
    const raw = String(tipoDose).toLowerCase()
    if (raw.includes("primeira") || raw === "1" || raw === "primeiradose") return "1ª Dose"
    if (raw.includes("segunda") || raw === "2" || raw === "segundadose") return "2ª Dose"
    return "Manutenção Anual"
}
export interface DoseTimelineItem {
    id: string
    rawDoseId?: number
    tipoDoseLabel: string
    dataTexto: string
    dataOriginalIso?: string | null
    status: "aplicada" | "pendente" | "atrasada" | "hoje"
    doseData?: DoseAplicacaoDesverminacaoListVm
}

interface AnimalInfo {
    id: number
    numeroRegistro: string
    especieNome?: string
    dataEntrada?: string | null
}

interface Props {
    open: boolean
    onClose: () => void
    /** Item da timeline clicado. Null = iniciar protocolo (ainda sem dose) */
    doseItem: DoseTimelineItem | null
    protocolo: ProtocoloDesverminacaoListVm | null
    animal: AnimalInfo
    onSuccess: () => void
}

export default function RegistrarDoseDesverminacaoModal({
    open,
    onClose,
    doseItem,
    protocolo,
    animal,
    onSuccess,
}: Props) {
    const userInfo = getUserInfo()

    const isNovaDose = !doseItem?.rawDoseId && !protocolo
    const isAplicada = doseItem?.status === "aplicada"
    const isAtrasada = doseItem?.status === "atrasada"
    const isHoje = doseItem?.status === "hoje"

    const existingDoseData = doseItem?.doseData ?? null

    const [responsavel, setResponsavel] = useState(userInfo?.name || "")
    const [dataHoraAdm, setDataHoraAdm] = useState(
        isAplicada && existingDoseData?.dataAplicacao
            ? toLocalIso(existingDoseData.dataAplicacao)
            : localIsoNow()
    )
    const [observacao, setObservacao] = useState(existingDoseData?.observacao ?? "")
    const [saving, setSaving] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    if (!open) return null

    const headerLabel = isNovaDose
        ? "Iniciar protocolo de desverminação"
        : isAplicada
            ? "Editar registro de dose"
            : "Confirmar aplicação de dose"

    const headerGradient = isAtrasada
        ? "bg-gradient-to-r from-red-600 to-red-700"
        : isAplicada
            ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
            : "bg-gradient-to-r from-blue-700 to-blue-800"

    const StatusIcon = isAtrasada ? AlertTriangle : isAplicada ? CheckCircle2 : RefreshCw

    const handleSalvar = async () => {
        if (!responsavel.trim()) {
            toast.error("O responsável é obrigatório.")
            return
        }
        if (new Date(dataHoraAdm) > new Date()) {
            toast.error("Não é permitido registrar uma dose no futuro.")
            return
        }

        setSaving(true)
        try {
            let protocoloId = protocolo?.id

            if (!protocoloId) {
                const novoProto = await createProtocoloDesverminacao({
                    animalId: animal.id,
                    dataEntrada: animal.dataEntrada ?? new Date().toISOString(),
                    temHistoricoDoses: true,
                })
                protocoloId = novoProto?.id ?? novoProto
            }

            if (!protocoloId) throw new Error("Protocolo não encontrado.")

            if (isAplicada && existingDoseData?.id) {
                await updateDoseAplicacaoDesverminacao({
                    id: existingDoseData.id,
                    protocoloDesverminacaoId: protocoloId,
                    tipoDose: parseTipoDoseToEnum(existingDoseData.tipoDose),
                    dataPrevista: existingDoseData.dataPrevista,
                    dataAplicacao: dataHoraAdm,
                    statusDoseDesverminacao: StatusDoseDesverminacao.Aplicada,
                    observacao: observacao || null,
                    responsavel,
                })
                toast.success("Registro de dose atualizado com sucesso!")
            } else if (existingDoseData?.id) {
                await updateDoseAplicacaoDesverminacao({
                    id: existingDoseData.id,
                    protocoloDesverminacaoId: protocoloId,
                    tipoDose: parseTipoDoseToEnum(existingDoseData.tipoDose),
                    dataPrevista: existingDoseData.dataPrevista,
                    dataAplicacao: dataHoraAdm,
                    statusDoseDesverminacao: StatusDoseDesverminacao.Aplicada,
                    observacao: observacao || null,
                    responsavel,
                })
                toast.success("Dose registrada como aplicada!")
            } else {
                const tipoDoseNumero = (() => {
                    const existentes = (protocolo as any)?.doses ?? []
                    const temPrimeira = existentes.some((d: any) => {
                        const raw = String(d.tipoDose).toLowerCase()
                        return raw.includes("primeira") || raw === "1" || raw === "primeiradose"
                    })
                    const temSegunda = existentes.some((d: any) => {
                        const raw = String(d.tipoDose).toLowerCase()
                        return raw.includes("segunda") || raw === "2" || raw === "segundadose"
                    })
                    if (!temPrimeira) return TipoDose.PrimeiraDose
                    if (!temSegunda) return TipoDose.SegundaDose
                    return TipoDose.Anual
                })()

                await createDoseAplicacaoDesverminacao({
                    protocoloDesverminacaoId: protocoloId,
                    tipoDose: tipoDoseNumero,
                    dataPrevista: dataHoraAdm,
                    dataAplicacao: dataHoraAdm,
                    statusDoseDesverminacao: StatusDoseDesverminacao.Aplicada,
                    observacao: observacao || null,
                    responsavel,
                })
                toast.success("Dose registrada com sucesso!")
            }

            onSuccess()
        } catch (err: any) {
            console.error("Erro ao salvar dose:", err)
            const msg =
                err?.response?.data?.ValidationErrors?.join(", ") ||
                err?.response?.data?.title ||
                err?.response?.data?.message ||
                "Erro ao registrar dose. Verifique os dados e tente novamente."
            toast.error(msg)
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!existingDoseData?.id) return
        setSaving(true)
        try {
            await deleteDoseAplicacaoDesverminacao(existingDoseData.id)
            toast.success("Registro excluído com sucesso!")
            setShowDeleteConfirm(false)
            onSuccess()
        } catch {
            toast.error("Erro ao excluir registro.")
            setSaving(false)
        }
    }

    const dataPrevistoTexto = existingDoseData?.dataPrevista
        ? formatDate(existingDoseData.dataPrevista)
        : doseItem?.dataOriginalIso
            ? formatDate(doseItem.dataOriginalIso)
            : "—"

    const dataAplicadaTexto = isAplicada && existingDoseData?.dataAplicacao
        ? formatDateTime(existingDoseData.dataAplicacao)
        : null

    const tipoDoseTexto = existingDoseData
        ? tipoDoseLabel(existingDoseData.tipoDose)
        : doseItem?.tipoDoseLabel ?? "Manutenção Anual"

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`rounded-t-2xl ${headerGradient} p-5 text-white`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                {/* Badges de status */}
                                <div className="flex items-center gap-2 mb-2">
                                    {isAtrasada && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100/30 border border-red-200/50 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                                            <AlertTriangle className="h-3 w-3" /> Atrasada
                                        </span>
                                    )}
                                    {isAplicada && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/30 border border-emerald-200/50 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                                            <CheckCircle2 className="h-3 w-3" /> Aplicada
                                        </span>
                                    )}
                                    {isHoje && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                                            <AlertCircle className="h-3 w-3" /> Hoje
                                        </span>
                                    )}
                                    {isNovaDose && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                                            Novo Protocolo
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-base font-semibold">{headerLabel}</h2>

                                {/* Info do animal */}
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5">
                                        <div>
                                            <p className="text-[10px] opacity-70 uppercase tracking-wide leading-none mb-0.5">Animal</p>
                                            <p className="text-sm font-bold leading-none">#{animal.numeroRegistro}</p>
                                        </div>
                                    </div>
                                    {animal.especieNome && (
                                        <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5">
                                            <div>
                                                <p className="text-[10px] opacity-70 uppercase tracking-wide leading-none mb-0.5">Espécie</p>
                                                <p className="text-sm font-bold leading-none">{animal.especieNome}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5">
                                        <div>
                                            <p className="text-[10px] opacity-70 uppercase tracking-wide leading-none mb-0.5">Tipo</p>
                                            <p className="text-sm font-bold leading-none">{tipoDoseTexto}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/20 transition ml-3 shrink-0">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {/* Linha de datas */}
                        <div className="flex gap-3">
                            <div className="flex-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                    <Clock className="inline h-3 w-3 mr-1" />Data prevista
                                </p>
                                <p className="text-sm font-semibold text-gray-800">{dataPrevistoTexto}</p>
                            </div>
                            {dataAplicadaTexto && (
                                <div className="flex-1 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
                                        <CheckCircle2 className="inline h-3 w-3 mr-1" />Aplicado em
                                    </p>
                                    <p className="text-sm font-semibold text-emerald-800">{dataAplicadaTexto}</p>
                                </div>
                            )}
                        </div>

                        {/* Card do tipo de dose */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <StatusIcon className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-semibold text-blue-800">
                                    {tipoDoseTexto}
                                </span>
                            </div>
                            {protocolo && (
                                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                                    <div>
                                        <span className="font-medium">Protocolo iniciado em:</span>{" "}
                                        {formatDate(protocolo.dataEntrada)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span>{" "}
                                        {(() => {
                                            const map: Record<string, string> = {
                                                "AguardandoPrimeiraDose": "Aguardando 1ª dose",
                                                "AguardandoSegundaDose": "Aguardando 2ª dose",
                                                "ManutencaoAnual": "Manutenção Anual",
                                                "Atrasado": "Atrasado",
                                                "Concluido": "Concluído",
                                                "Suspenso": "Suspenso"
                                            };
                                            return protocolo.statusProtocolo ? (map[protocolo.statusProtocolo] || protocolo.statusProtocolo.replace(/([A-Z])/g, ' $1').trim()) : "—";
                                        })()}
                                    </div>
                                </div>
                            )}
                            {existingDoseData?.observacao && (
                                <div className="text-xs text-blue-700 italic">
                                    <span className="font-medium">Obs. anterior:</span>{" "}
                                    {existingDoseData.observacao}
                                </div>
                            )}
                        </div>

                        {/* Avisos contextuais */}
                        {isAtrasada && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-700">
                                    Esta dose está <strong>atrasada</strong>. Confirme a aplicação para regularizar o histórico.
                                </p>
                            </div>
                        )}
                        {isAplicada && (
                            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-emerald-700">
                                    Você está <strong>editando</strong> um registro já confirmado. Os dados anteriores estão pré-carregados.
                                </p>
                            </div>
                        )}
                        {isNovaDose && (
                            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                                <FileText className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700">
                                    Nenhum protocolo encontrado para este animal. Ao confirmar, um <strong>novo protocolo</strong> será criado automaticamente.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Calendar className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                                    {isAtrasada ? "Data em que foi aplicado" : "Data da aplicação"}
                                </label>
                                <input
                                    type="datetime-local"
                                    value={dataHoraAdm}
                                    max={localIsoNow()}
                                    onChange={(e) => setDataHoraAdm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Observação <span className="text-xs text-gray-400">(opcional)</span>
                            </label>
                            <textarea
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                rows={3}
                                placeholder="Anotações sobre a aplicação da dose..."
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <User className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                                Responsável <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={responsavel}
                                onChange={(e) => setResponsavel(e.target.value)}
                                placeholder="Nome do responsável"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
                        <div>
                            {isAplicada && existingDoseData?.id && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={saving}
                                    className="text-xs font-medium text-gray-400 hover:text-red-500 hover:underline transition"
                                >
                                    Excluir registro
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSalvar}
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-60"
                            >
                                {saving ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                {saving ? "Salvando..." : isAplicada ? "Atualizar registro" : "Confirmar aplicação"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Excluir Registro de Dose"
                description="Deseja realmente excluir este registro de dose de desverminação? Esta ação não poderá ser desfeita."
                loading={saving}
            />
        </>
    )
}
