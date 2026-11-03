import React, { useState } from "react"
import { X, Pill, User, Clock, CheckCircle2, AlertTriangle, PawPrint, Calendar } from "lucide-react"
import { toast } from "sonner"
import { type MedicacaoAdministradaListVm, type CreateMedicacaoAdministradaCommand, type UpdateMedicacaoAdministradaCommand, medicacaoAdministradaService } from "@/services/MedicacaoAdministradaService"
import { type PrescricaoMedicacaoListVm } from "@/services/PrescricaoMedicacaoService"
import { type AnimalLookupVm } from "@/services/animalService"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import { getUserInfo } from "@/services/api"
import { usePermissions } from "@/contexts/PermissionsContext"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"

const StatusDoseEnum = {
    Agendada: 1,
    Atrasada: 2,
    Concluido: 3,
} as const

interface Props {
    open: boolean
    onClose: () => void
    dose: MedicacaoAdministradaListVm | null
    prescricao: PrescricaoMedicacaoListVm
    animal: AnimalLookupVm | null
    hour: number | null
    selectedDate: Date
    onSuccess: () => void
}

const padZ = (n: number) => String(n).padStart(2, "0")

const localIsoNow = () => {
    const d = new Date()
    return `${d.getFullYear()}-${padZ(d.getMonth() + 1)}-${padZ(d.getDate())}T${padZ(d.getHours())}:${padZ(d.getMinutes())}`
}

const toLocalIso = (isoString: string) => {
    const d = new Date(isoString)
    return `${d.getFullYear()}-${padZ(d.getMonth() + 1)}-${padZ(d.getDate())}T${padZ(d.getHours())}:${padZ(d.getMinutes())}`
}

const makeDataHoraPrevista = (date: Date, hour: number) => {
    const d = new Date(date)
    const y = d.getFullYear()
    const m = padZ(d.getMonth() + 1)
    const dd = padZ(d.getDate())
    return `${y}-${m}-${dd}T${padZ(hour)}:00:00`
}

const formatDateTime = (isoString: string) =>
    new Date(isoString).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    })

export default function RegistrarAdministracaoModal({ open, onClose, dose, prescricao, animal, hour, selectedDate, onSuccess }: Props) {
    const isDoseAvulsa = !dose
    const isConcluido = dose?.statusDose === "Concluido"
    const isAtrasada = dose?.statusDose === "Atrasada"

    const userInfo = getUserInfo()
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Registrar dose de medicação", "Editar")
    const canGerenciar = hasPermission("Registrar dose de medicação", "Gerenciar")
    
    const [responsavel, setResponsavel] = useState(dose?.responsavel || userInfo?.name || "")
    const [dataHoraAdm, setDataHoraAdm] = useState(
        isConcluido && dose?.dataHoraAdministracao
            ? toLocalIso(dose.dataHoraAdministracao)
            : localIsoNow()
    )
    const [observacao, setObservacao] = useState(dose?.observacao ?? "")
    const [saving, setSaving] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    if (!open) return null

    const handleSalvar = async () => {
        if (!responsavel.trim()) {
            toast.error("O responsável é obrigatório.")
            return
        }

        if (new Date(dataHoraAdm) > new Date()) {
            toast.error("Não é permitido registrar uma administração no futuro.")
            return
        }

        setSaving(true)
        try {
            if (isDoseAvulsa) {
                const cmd: CreateMedicacaoAdministradaCommand = {
                    prescricaoMedicacaoId: prescricao.id,
                    dataHoraAdministracao: dataHoraAdm,
                    dataHoraPrevista: makeDataHoraPrevista(selectedDate, hour ?? 0),
                    observacao: observacao || undefined,
                    responsavel: responsavel.trim(),
                    statusDose: StatusDoseEnum.Concluido,
                }
                await medicacaoAdministradaService.create(cmd)
                toast.success("Dose avulsa registrada com sucesso!")
            } else {
                const cmd: UpdateMedicacaoAdministradaCommand = {
                    id: dose.id,
                    prescricaoMedicacaoId: dose.prescricaoMedicacaoId,
                    dataHoraAdministracao: dataHoraAdm,
                    dataHoraPrevista: dose.dataHoraPrevista,
                    observacao: observacao || undefined,
                    responsavel: responsavel.trim(),
                    statusDose: StatusDoseEnum.Concluido,
                }
                await medicacaoAdministradaService.update(cmd)
                toast.success(isConcluido ? "Administração atualizada!" : "Dose registrada como concluída!")
            }
            onSuccess()
        } catch {
            toast.error("Erro ao registrar administração.")
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!dose?.id) return

        setSaving(true)
        try {
            const previsao = new Date(dose.dataHoraPrevista)
            const novoStatus = previsao < new Date() ? StatusDoseEnum.Atrasada : StatusDoseEnum.Agendada

            const response = await medicacaoAdministradaService.update({
                id: dose.id,
                prescricaoMedicacaoId: dose.prescricaoMedicacaoId,
                dataHoraAdministracao: null,
                dataHoraPrevista: dose.dataHoraPrevista,
                observacao: "",
                responsavel: "",
                statusDose: novoStatus
            })

            if (response && response.success === false) {
                toast.error(response.message || "Erro de validação.")
                console.error(response.validationErrors)
                setSaving(false)
                return
            }

            toast.success("Registro de administração excluído com sucesso!")
            setShowDeleteConfirm(false)
            onSuccess()
        } catch {
            toast.error("Erro ao excluir registro de administração.")
            setSaving(false)
        }
    }

    const horarioPrevisto = dose
        ? formatDateTime(dose.dataHoraPrevista)
        : hour !== null
            ? `${padZ(hour)}:00`
            : "—"

    const horarioAdministrado = isConcluido && dose?.dataHoraAdministracao
        ? formatDateTime(dose.dataHoraAdministracao)
        : null

    const headerLabel = isDoseAvulsa
        ? "Registrar dose extra"
        : isConcluido
            ? "Editar administração"
            : "Confirmar administração"

    const headerGradient = isAtrasada
        ? "bg-gradient-to-r from-red-600 to-red-700"
        : isConcluido
            ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
            : "bg-gradient-to-r from-blue-600 to-blue-700"

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white dark:bg-[#1e1f29] border border-transparent dark:border-zinc-800 shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`rounded-t-2xl ${headerGradient} p-5 text-white`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {isAtrasada && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100/30 border border-red-200/50 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                                            <AlertTriangle className="h-3 w-3" /> Atrasada
                                        </span>
                                    )}
                                    {isConcluido && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/30 border border-emerald-200/50 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                                            <CheckCircle2 className="h-3 w-3" /> Concluída
                                        </span>
                                    )}
                                    {isDoseAvulsa && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
                                            Dose Extra
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-base font-semibold">{headerLabel}</h2>

                                {/* Destaque do animal */}
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5">
                                        <div>
                                            <p className="text-[10px] opacity-70 uppercase tracking-wide leading-none mb-0.5">Animal</p>
                                            <p className="text-sm font-bold leading-none">#{animal?.numeroRegistro ?? "—"}</p>
                                        </div>
                                    </div>
                                    {animal?.especieNome && (
                                        <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5">
                                            <div>
                                                <p className="text-[10px] opacity-70 uppercase tracking-wide leading-none mb-0.5">Espécie</p>
                                                <p className="text-sm font-bold leading-none">{animal.especieNome}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1 hover:bg-white/20 transition ml-3 shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {/* Horários (previsto e administrado) */}
                        <div className="flex gap-3">
                            <div className="flex-1 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 px-3 py-2.5">
                                <p className="text-[10px] font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
                                    <Clock className="inline h-3 w-3 mr-1" />Horário previsto
                                </p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100">{horarioPrevisto}</p>
                            </div>
                            {horarioAdministrado && (
                                <div className="flex-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2.5">
                                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                                        <CheckCircle2 className="inline h-3 w-3 mr-1" />Administrado em
                                    </p>
                                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{horarioAdministrado}</p>
                                </div>
                            )}
                        </div>

                        {/* Card da medicação */}
                        <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Pill className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{prescricao.medicacaoNome}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-blue-700 dark:text-blue-300">
                                <div>
                                    <span className="font-medium">Dose:</span> {prescricao.volumeDose}
                                </div>
                                <div>
                                    <span className="font-medium">Via:</span> {prescricao.viaAdministracao}
                                </div>
                                <div>
                                    <span className="font-medium">Intervalo:</span> {prescricao.intervaloEntreDosesHoras}h
                                </div>
                                {prescricao.observacao && (
                                    <div className="col-span-3 italic">
                                        <span className="font-medium">Obs. prescrição:</span> {prescricao.observacao}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isAtrasada && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3">
                                <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    Esta dose está <strong>atrasada</strong>. Registre a administração para regularizar o histórico.
                                    Os próximos horários serão recalculados automaticamente.
                                </p>
                            </div>
                        )}

                        {isConcluido && (
                            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                    Você está <strong>editando</strong> uma dose já concluída. Os dados anteriores estão pré-carregados.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <ResponsavelSelect
                                disabled={!canEdit}
                                value={responsavel}
                                onChange={setResponsavel}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1.5">
                                    <Calendar className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                                    Data e hora {isAtrasada ? "em que foi administrado" : "da administração"}
                                </label>
                                <input
                                    disabled={!canEdit}
                                    type="datetime-local"
                                    value={dataHoraAdm}
                                    max={localIsoNow()}
                                    onChange={(e) => setDataHoraAdm(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 dark:bg-zinc-900/60 px-3 py-2 text-sm text-gray-800 dark:text-zinc-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1.5">
                                Observação <span className="text-xs text-gray-400">(opcional)</span>
                            </label>
                            <textarea
                                disabled={!canEdit}
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                rows={4}
                                placeholder="Anotações sobre a administração..."
                                className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 dark:bg-zinc-900/60 px-3 py-2 text-sm text-gray-800 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 px-5 py-4">
                        <div>
                            {isConcluido && canGerenciar && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={saving}
                                    className="text-xs font-medium text-gray-400 dark:text-zinc-400 hover:text-red-500 hover:underline transition"
                                    title="Excluir este registro"
                                >
                                    Excluir
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="rounded-lg border border-gray-200 dark:border-zinc-700 px-4 py-2 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                            >
                                {canEdit ? "Cancelar" : "Fechar"}
                            </button>
                            {canEdit && (
                                <button
                                    onClick={handleSalvar}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-60"
                                >
                                    {saving ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    {saving ? "Salvando..." : isConcluido ? "Atualizar administração" : "Confirmar administração"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Excluir Administração"
                description="Deseja realmente excluir este registro de administração? Esta ação não poderá ser desfeita e os próximos horários poderão ser afetados."
                loading={saving}
            />
        </>
    )
}
