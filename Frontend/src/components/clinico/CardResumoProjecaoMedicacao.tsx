import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Pill, Clock, CheckCircle2, User, Calendar, AlertCircle, ArrowRight } from 'lucide-react'
import CardsForSummary from '@/components/CardsForSummary'
import { VIA_ADMINISTRACAO_OPTIONS } from '@/routes/Medicacao/NovaPrescricao'
import type { FormPrescricao } from '@/routes/Medicacao/NovaPrescricao'
import type { MedicacaoLookupVm } from '@/services/MedicacaoService'
import type { MedicacaoAdministradaListVm } from '@/services/MedicacaoAdministradaService'
import { TimelineDoses, type TimelineDoseItem } from './TimelineDoses'

interface CardResumoProjecaoMedicacaoProps {
    prescricoes: FormPrescricao[]
    medicacoes: MedicacaoLookupVm[]
    doses?: MedicacaoAdministradaListVm[]
    animalId?: number | string
}

const calcProjecaoDoses = (form: FormPrescricao): Date[] => {
    const qtd = parseInt(form.quantidadeDoses) || 0
    const intervalo = parseInt(form.intervaloHoras) || 0
    const inicio = form.dataHoraInicio ? new Date(form.dataHoraInicio) : null
    if (!inicio || isNaN(inicio.getTime()) || qtd <= 0 || intervalo <= 0) return []
    return Array.from({ length: qtd }, (_, i) => {
        const d = new Date(inicio)
        d.setHours(d.getHours() + i * intervalo)
        return d
    })
}

const formatDateTime = (d: Date) =>
    d.toLocaleString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    })

const formatDateTimeShort = (d: Date) =>
    d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    })

const formatDateISO = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function CardResumoProjecaoMedicacao({
    prescricoes,
    medicacoes,
    doses = [],
    animalId,
}: CardResumoProjecaoMedicacaoProps) {
    const navigate = useNavigate()
    const temDoseAdministrada = doses.some(d => d.statusDose === "Concluido" || !!d.dataHoraAdministracao)

    const totalDoses = doses.length
    const concluidas = doses.filter(d => d.statusDose === "Concluido").length

    const proximaDose = (() => {
        const pendente = doses.find(d => d.statusDose !== "Concluido")
        if (pendente) {
            const dt = new Date(pendente.dataHoraPrevista.length === 10 ? `${pendente.dataHoraPrevista}T00:00:00` : pendente.dataHoraPrevista)
            return isNaN(dt.getTime()) ? null : dt
        }
        return null
    })()

    const targetDateIso = (() => {
        if (proximaDose) {
            return formatDateISO(proximaDose)
        }
        if (doses.length > 0) {
            const first = doses[0].dataHoraPrevista
            if (first) return first.slice(0, 10)
        }
        if (prescricoes.length > 0 && prescricoes[0].dataHoraInicio) {
            return prescricoes[0].dataHoraInicio.slice(0, 10)
        }
        return null
    })()

    const handleGoToMapa = () => {
        const params = new URLSearchParams()
        if (animalId) params.append("animalId", String(animalId))
        if (targetDateIso) params.append("data", targetDateIso)
        const qs = params.toString()
        navigate(`/clinico/mapa-execucao${qs ? `?${qs}` : ""}`)
    }

    const timelineItems: TimelineDoseItem[] = (() => {
        if (!doses.length) return []
        const now = new Date()
        return doses.map((d, idx) => {
            const dt = new Date(d.dataHoraPrevista.length === 10 ? `${d.dataHoraPrevista}T00:00:00` : d.dataHoraPrevista)
            const isCompleted = d.statusDose === "Concluido"
            const isOverdue = !isCompleted && dt < now
            const isActive = !isCompleted && !isOverdue && doses.findIndex(x => x.statusDose !== "Concluido") === idx
            return {
                stepNumber: idx + 1,
                dateText: formatDateTimeShort(dt),
                badgeText: isCompleted ? "aplicada" : isOverdue ? "atrasada" : isActive ? "próxima" : "aguardando",
                isCompleted,
                isOverdue,
                isActive,
            }
        })
    })()

    return (
        <div className="flex flex-col gap-6">
            {/* Bloco 1: Resumo da prescrição */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-700 px-4 py-3">
                    <h3 className="text-sm font-semibold text-white">Resumo da prescrição</h3>
                </div>
                <div className="p-4 space-y-6">
                    {prescricoes.map((p, idx) => {
                        const medicacao = medicacoes.find(m => String(m.id) === p.medicacaoId)
                        return (
                            <div key={p.id} className={idx > 0 ? "pt-4 border-t border-gray-100" : ""}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Pill className="h-4 w-4 text-blue-500" />
                                    <h4 className="font-semibold text-gray-800 dark:text-zinc-100 text-sm">
                                        Medicação {idx + 1}: {medicacao ? `${medicacao.principioAtivo} - ${medicacao.nomeComercial}` : "não selecionada"}
                                    </h4>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
                                    <div className="flex justify-between">
                                        <span>Dose:</span>
                                        <span className="font-medium text-gray-900 dark:text-zinc-100">{p.volumeDose || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Via:</span>
                                        <span className="font-medium text-gray-900 dark:text-zinc-100">
                                            {VIA_ADMINISTRACAO_OPTIONS.find((o) => o.value === p.viaAdministracao)?.label ?? "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Intervalo:</span>
                                        <span className="font-medium text-gray-900 dark:text-zinc-100">{p.intervaloHoras ? `A cada ${p.intervaloHoras} horas` : "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total de doses:</span>
                                        <span className="font-medium text-gray-900 dark:text-zinc-100">{p.quantidadeDoses || "—"} doses</span>
                                    </div>
                                    {p.observacao && (
                                        <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-xs flex gap-2">
                                            <span className="font-semibold shrink-0">Obs.:</span>
                                            <span>{p.observacao}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Bloco 2: Horário de doses */}
            {prescricoes.some(p => p.quantidadeDoses && p.intervaloHoras && p.dataHoraInicio) && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-200">Horário de doses</h3>
                    </div>
                    <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
                        {prescricoes.map((p, idx) => {
                            const projecao = calcProjecaoDoses(p)
                            if (projecao.length === 0) return null
                            const medicacao = medicacoes.find(m => String(m.id) === p.medicacaoId)
                            return (
                                <div key={p.id} className={idx > 0 ? "pt-4 border-t border-gray-100" : ""}>
                                    <h4 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-3">
                                        Medicação {idx + 1}: {medicacao ? `${medicacao.principioAtivo} - ${medicacao.nomeComercial}` : ""}
                                    </h4>

                                    <div className="relative space-y-3">
                                        {projecao.length > 1 && (
                                            <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-gray-200" />
                                        )}

                                        {projecao.map((d, i) => (
                                            <div key={i} className="relative flex items-center gap-3">
                                                <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white shrink-0">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 flex justify-between items-center px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-card text-xs text-gray-700 dark:text-zinc-200 shadow-sm">
                                                    <span className="capitalize">{formatDateTime(d)}</span>
                                                    <span className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                                                        {i + 1}ª dose
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Bloco 3: Histórico de registro de doses (exibido após medicação prescrita ter ao menos uma dose administrada registrada) */}
            {temDoseAdministrada && (
                <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-card shadow-xs overflow-hidden">
                    <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                                    <Pill className="h-4 w-4" />
                                </span>
                                Histórico de registro de doses
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                                {concluidas} de {totalDoses} doses aplicadas
                            </span>
                        </div>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                        {/* Timeline de status horizontal */}
                        {timelineItems.length > 0 && (
                            <TimelineDoses items={timelineItems} orientation="horizontal" maxVisible={8} />
                        )}

                        {/* Próxima dose ou aviso de conclusão */}
                        {proximaDose && concluidas < totalDoses && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>
                                    Próxima dose: <span className="font-semibold text-slate-800">{formatDateTimeShort(proximaDose)}</span>
                                </span>
                            </div>
                        )}

                        {concluidas >= totalDoses && totalDoses > 0 && (
                            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-medium">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Todas as doses previstas já foram aplicadas.</span>
                            </div>
                        )}

                        {/* Lista detalhada das doses registradas/previstas */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                Detalhes das doses
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {doses.map((d, index) => {
                                    const dtPrevista = new Date(d.dataHoraPrevista.length === 10 ? `${d.dataHoraPrevista}T00:00:00` : d.dataHoraPrevista)
                                    const dtAdmin = d.dataHoraAdministracao ? new Date(d.dataHoraAdministracao) : null
                                    const isConcluido = d.statusDose === "Concluido"
                                    const isOverdue = !isConcluido && dtPrevista < new Date()

                                    return (
                                        <div
                                            key={d.id || index}
                                            className={`p-2.5 rounded-lg border text-xs transition-colors ${
                                                isConcluido
                                                    ? "border-emerald-200 bg-emerald-50/40"
                                                    : isOverdue
                                                    ? "border-red-200 bg-red-50/40"
                                                    : "border-slate-200 bg-slate-50/50"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="font-semibold text-slate-800">
                                                    {index + 1}ª dose
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        isConcluido
                                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                            : isOverdue
                                                            ? "bg-red-100 text-red-800 border border-red-300"
                                                            : "bg-blue-100 text-blue-800 border border-blue-200"
                                                    }`}
                                                >
                                                    {isConcluido ? "Aplicada" : isOverdue ? "Atrasada" : "Aguardando"}
                                                </span>
                                            </div>

                                            <div className="text-[11px] text-slate-600 space-y-0.5">
                                                <div>
                                                    <span className="text-slate-400">Prevista:</span>{" "}
                                                    <span className="font-medium">{formatDateTimeShort(dtPrevista)}</span>
                                                </div>
                                                {isConcluido && dtAdmin && !isNaN(dtAdmin.getTime()) && (
                                                    <div>
                                                        <span className="text-slate-400">Aplicada em:</span>{" "}
                                                        <span className="font-medium text-emerald-800">{formatDateTimeShort(dtAdmin)}</span>
                                                    </div>
                                                )}
                                                {d.responsavel && (
                                                    <div className="flex items-center gap-1 text-slate-500">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        <span>{d.responsavel}</span>
                                                    </div>
                                                )}
                                                {d.observacao && (
                                                    <div className="text-slate-500 italic mt-0.5">
                                                        Obs: {d.observacao}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={handleGoToMapa}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
                        >
                            Ir para o mapa de execução <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
