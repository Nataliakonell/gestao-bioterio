import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Pill, Clock, ArrowRight } from "lucide-react"
import { prescricaoMedicacaoService, type PrescricaoMedicacaoListVm } from "@/services/PrescricaoMedicacaoService"
import { medicacaoAdministradaService, type MedicacaoAdministradaListVm } from "@/services/MedicacaoAdministradaService"
import { TimelineDoses, type TimelineDoseItem } from "./TimelineDoses"

interface PrescricoesAtivasCardProps {
    animalId: number
    refreshKey?: number
}

const formatDateTimeShort = (d: Date) =>
    d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })

const formatDateOnly = (iso: string) =>
    new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("pt-BR")

export function PrescricoesAtivasCard({ animalId, refreshKey = 0 }: PrescricoesAtivasCardProps) {
    const navigate = useNavigate()
    const [prescricoes, setPrescricoes] = useState<PrescricaoMedicacaoListVm[] | null>(null)
    const [dosesMap, setDosesMap] = useState<Map<number, MedicacaoAdministradaListVm[]>>(new Map())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const fetch = async () => {
            setLoading(true)
            try {
                const [allPrescricoes, allDoses] = await Promise.all([
                    prescricaoMedicacaoService.getAll({ animalId }).catch(() => [] as PrescricaoMedicacaoListVm[]),
                    medicacaoAdministradaService.getAll({ animalId }).catch(() => [] as MedicacaoAdministradaListVm[]),
                ])
                if (cancelled) return
                const tempMap = new Map<number, MedicacaoAdministradaListVm[]>()
                for (const d of allDoses) {
                    const list = tempMap.get(d.prescricaoMedicacaoId) ?? []
                    list.push(d)
                    tempMap.set(d.prescricaoMedicacaoId, list)
                }
                for (const [, list] of tempMap) {
                    list.sort((a, b) => new Date(a.dataHoraPrevista).getTime() - new Date(b.dataHoraPrevista).getTime())
                }

                const ativas = allPrescricoes.filter(p => {
                    if (p.status !== "Ativa") return false
                    const total = p.totalAdministracoes || p.quantidadeDoses || 0
                    const concluidas = p.administracoesConcluidas || 0
                    if (total > 0 && concluidas >= total) return false
                    const doses = tempMap.get(p.id) ?? []
                    if (doses.length > 0 && doses.every(d => d.statusDose === "Concluido")) return false
                    return true
                })
                setPrescricoes(ativas)

                const map = new Map<number, MedicacaoAdministradaListVm[]>()
                for (const [k, v] of tempMap) {
                    if (ativas.some(p => p.id === k)) map.set(k, v)
                }
                setDosesMap(map)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetch()
        return () => { cancelled = true }
    }, [animalId, refreshKey])

    const hasAtivas = prescricoes !== null && prescricoes.length > 0

    const handleGoToMapa = () => {
        const params = new URLSearchParams()
        if (animalId) params.append("animalId", String(animalId))

        let targetDateIso: string | null = null
        for (const [, doses] of dosesMap) {
            const pendente = doses.find(d => d.statusDose !== "Concluido")
            if (pendente?.dataHoraPrevista) {
                targetDateIso = pendente.dataHoraPrevista.slice(0, 10)
                break
            }
            if (!targetDateIso && doses.length > 0 && doses[0].dataHoraPrevista) {
                targetDateIso = doses[0].dataHoraPrevista.slice(0, 10)
            }
        }
        if (!targetDateIso && prescricoes && prescricoes.length > 0) {
            const first = prescricoes[0]
            if (first.dataHoraInicio) {
                targetDateIso = first.dataHoraInicio.slice(0, 10)
            }
        }

        if (targetDateIso) params.append("data", targetDateIso)
        const qs = params.toString()
        navigate(`/clinico/mapa-execucao${qs ? `?${qs}` : ""}`)
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-xs">
                <div className="h-4 w-32 bg-slate-100 animate-pulse rounded mb-3" />
                <div className="h-12 bg-slate-50 animate-pulse rounded" />
            </div>
        )
    }

    if (!hasAtivas) return null

    return (
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-card shadow-xs overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                            <Pill className="h-4 w-4" />
                        </span>
                        Prescrições ativas
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                        {prescricoes!.length}
                    </span>
                </div>
            </div>

            <div className="px-5 py-4 space-y-5">
                {prescricoes!.map((p) => {
                    const doses = dosesMap.get(p.id) ?? []
                    const total = p.quantidadeDoses || p.totalAdministracoes || doses.length || 0
                    const concluidas = p.administracoesConcluidas || doses.filter(d => d.statusDose === "Concluido").length
                    const proximaDose = (() => {
                        const pendente = doses.find(d => d.statusDose !== "Concluido")
                        if (pendente) return new Date(pendente.dataHoraPrevista.length === 10 ? `${pendente.dataHoraPrevista}T00:00:00` : pendente.dataHoraPrevista)
                        if (p.dataHoraInicio && total > 0) {
                            const inicio = new Date(p.dataHoraInicio.length === 10 ? `${p.dataHoraInicio}T00:00:00` : p.dataHoraInicio)
                            const intervalo = p.intervaloEntreDosesHoras || 0
                            if (!isNaN(inicio.getTime()) && intervalo >= 0) {
                                const next = new Date(inicio)
                                next.setHours(next.getHours() + concluidas * intervalo)
                                return next
                            }
                        }
                        return null
                    })()

                    const timelineItems: TimelineDoseItem[] = (() => {
                        if (doses.length > 0) {
                            const now = new Date()
                            return doses.map((d, idx) => {
                                const dt = new Date(d.dataHoraPrevista.length === 10 ? `${d.dataHoraPrevista}T00:00:00` : d.dataHoraPrevista)
                                const isCompleted = d.statusDose === "Concluido"
                                const isOverdue = !isCompleted && dt < now
                                const isActive = !isCompleted && !isOverdue && doses.findIndex(x => x.statusDose !== "Concluido") === idx
                                return {
                                    stepNumber: idx + 1,
                                    dateText: formatDateTimeShort(dt),
                                    badgeText: isCompleted ? "aplicada" : isOverdue ? "atrasada" : isActive ? "próxima" : undefined,
                                    isCompleted,
                                    isOverdue,
                                    isActive,
                                }
                            })
                        }
                        const inicio = p.dataHoraInicio ? new Date(p.dataHoraInicio.length === 10 ? `${p.dataHoraInicio}T00:00:00` : p.dataHoraInicio) : null
                        if (!inicio || isNaN(inicio.getTime()) || total <= 0) return []
                        return Array.from({ length: Math.min(total, 12) }, (_, i) => {
                            const d = new Date(inicio)
                            d.setHours(d.getHours() + i * (p.intervaloEntreDosesHoras || 0))
                            const isCompleted = i < concluidas
                            const isActive = i === concluidas
                            return {
                                stepNumber: i + 1,
                                dateText: formatDateTimeShort(d),
                                badgeText: isCompleted ? "aplicada" : isActive ? "próxima" : undefined,
                                isCompleted,
                                isActive,
                            }
                        })
                    })()

                    return (
                        <div key={p.id} className="space-y-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-zinc-100 leading-tight">
                                        {p.medicacaoNome || "Medicação"}
                                    </h4>
                                    {p.status === "Ativa" && (
                                        <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                                            Ativa
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                                    <span>
                                        <span className="text-slate-400 dark:text-zinc-400">Dose:</span>{" "}
                                        <span className="font-medium text-slate-800 dark:text-zinc-200">{p.volumeDose || "—"}</span>
                                    </span>
                                    <span>
                                        <span className="text-slate-400 dark:text-zinc-400">Intervalo:</span>{" "}
                                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                                            {p.intervaloEntreDosesHoras ? `A cada ${p.intervaloEntreDosesHoras}h` : "—"}
                                        </span>
                                    </span>
                                    <span>
                                        <span className="text-slate-400 dark:text-zinc-400">Progresso:</span>{" "}
                                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                                            {concluidas} de {total} doses aplicadas
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {timelineItems.length > 0 && (
                                <TimelineDoses items={timelineItems} orientation="horizontal" maxVisible={8} />
                            )}

                            {proximaDose && concluidas < total && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>
                                        Próxima dose: <span className="font-semibold text-slate-800">{formatDateTimeShort(proximaDose)}</span>
                                    </span>
                                </div>
                            )}
                            {concluidas >= total && total > 0 && (
                                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                    Todas as doses previstas já foram aplicadas.
                                </div>
                            )}
                        </div>
                    )
                })}
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
    )
}
