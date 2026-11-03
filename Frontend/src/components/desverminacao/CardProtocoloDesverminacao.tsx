import React from "react"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import type { ProtocoloDesverminacaoListVm } from "@/services/ProtocoloDesverminacaoService"
import { HorizontalCard } from "@/components/horizontal-card"

const formatDateStr = (dateInput: string | Date | null | undefined) => {
    if (!dateInput) return "—"
    const str = typeof dateInput === "string" ? dateInput : dateInput.toISOString()
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
        const [, year, month, day] = match
        return `${day}/${month}/${year}`
    }
    const d = new Date(str)
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("pt-BR")
}

const addDays = (baseDateStr: string, days: number): string => {
    const d = new Date(baseDateStr)
    if (isNaN(d.getTime())) return ""
    d.setDate(d.getDate() + days)
    return d.toISOString()
}

interface CardProtocoloDesverminacaoProps {
    item: ProtocoloDesverminacaoListVm
    onClick?: () => void
}

export function CardProtocoloDesverminacao({ item, onClick }: CardProtocoloDesverminacaoProps) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const doses = item.doses || []

    const isDoseAplicada = (d: any) =>
        d.statusDoseDesverminacao === "Aplicada" || d.statusDoseDesverminacao === "4" || !!d.dataAplicacao

    const dosesAplicadas = doses.filter(isDoseAplicada)
    const dosesAgendadas = doses.filter((d) => !isDoseAplicada(d))

    const dose1 = doses.find((d) => d.tipoDose === "PrimeiraDose" || d.tipoDose === "1")
    const dose2 = doses.find((d) => d.tipoDose === "SegundaDose" || d.tipoDose === "2")

    const doseAnualAplicada = dosesAplicadas
        .filter((d) => d.tipoDose === "Anual" || d.tipoDose === "3")
        .sort((a, b) => new Date(b.dataAplicacao || b.dataPrevista).getTime() - new Date(a.dataAplicacao || a.dataPrevista).getTime())[0]

    const is1aConcluida =
        dose1?.statusDoseDesverminacao === "Aplicada" ||
        !!dose1?.dataAplicacao ||
        dosesAplicadas.some((d) => d.tipoDose === "SegundaDose" || d.tipoDose === "2" || d.tipoDose === "Anual" || d.tipoDose === "3")

    const is2aConcluida =
        dose2?.statusDoseDesverminacao === "Aplicada" ||
        !!dose2?.dataAplicacao ||
        dosesAplicadas.some((d) => d.tipoDose === "Anual" || d.tipoDose === "3")

    const isAnualConcluida = !!doseAnualAplicada

    const date1a = dose1?.dataAplicacao || dose1?.dataPrevista || (item.dataEntrada ? addDays(item.dataEntrada, 60) : "")
    const date2a = dose2?.dataAplicacao || dose2?.dataPrevista || (date1a ? addDays(date1a, 15) : "")
    const dateAnual = doseAnualAplicada?.dataAplicacao || doseAnualAplicada?.dataPrevista || (date2a ? addDays(date2a, 365) : "")

    const isToday = (dateStr: string) => {
        if (!dateStr) return false
        const d = new Date(dateStr)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === hoje.getTime()
    }

    const isOverdue = (dateStr: string) => {
        if (!dateStr) return false
        const d = new Date(dateStr)
        d.setHours(0, 0, 0, 0)
        return d.getTime() < hoje.getTime()
    }

    const statusDose1: "concluido" | "atrasado" | "hoje" | "pendente" = is1aConcluida
        ? "concluido"
        : isOverdue(date1a)
        ? "atrasado"
        : isToday(date1a)
        ? "hoje"
        : "pendente"

    const statusDose2: "concluido" | "atrasado" | "hoje" | "pendente" = is2aConcluida
        ? "concluido"
        : is1aConcluida && isOverdue(date2a)
        ? "atrasado"
        : is1aConcluida && isToday(date2a)
        ? "hoje"
        : "pendente"

    const isManutencao =
        item.cicloInicialConcluido ||
        item.statusProtocolo === "ManutencaoAnual" ||
        is2aConcluida ||
        isAnualConcluida

    let cardStatus: "atrasado" | "hoje_1a" | "hoje_2a" | "manutencao" | "em_andamento" = "em_andamento"
    if (isManutencao) {
        cardStatus = "manutencao"
    } else if (statusDose1 === "atrasado" || statusDose2 === "atrasado") {
        cardStatus = "atrasado"
    } else if (statusDose2 === "hoje") {
        cardStatus = "hoje_2a"
    } else if (statusDose1 === "hoje") {
        cardStatus = "hoje_1a"
    } else {
        cardStatus = "em_andamento"
    }

    let borderClass = "border-l-amber-400"
    let badgeNode = (
        <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
            Ciclo inicial em andamento
        </span>
    )

    if (cardStatus === "hoje_2a") {
        borderClass = "border-l-blue-500"
        badgeNode = (
            <span className="bg-blue-100/80 text-blue-700 px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                Iniciar 2ª dose hoje
            </span>
        )
    } else if (cardStatus === "hoje_1a") {
        borderClass = "border-l-blue-500"
        badgeNode = (
            <span className="bg-blue-100/80 text-blue-700 px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                Iniciar 1ª dose hoje
            </span>
        )
    } else if (cardStatus === "atrasado") {
        borderClass = "border-l-red-500"
        badgeNode = (
            <span className="bg-red-100 text-red-600 px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                Atrasado
            </span>
        )
    } else if (cardStatus === "manutencao") {
        borderClass = "border-l-emerald-500"
        badgeNode = (
            <span className="bg-emerald-100/80 text-emerald-700 px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                Manutenção anual
            </span>
        )
    }

    const renderDoseIconAndText = (
        label: string,
        dateStr: string,
        st: "concluido" | "atrasado" | "hoje" | "pendente"
    ) => {
        if (st === "concluido") {
            return (
                <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-gray-400 font-normal">{label}</span>
                    <span className="text-gray-900 font-semibold">{formatDateStr(dateStr)}</span>
                </div>
            )
        }
        if (st === "atrasado") {
            return (
                <div className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-red-500 font-normal">{label}</span>
                    <span className="text-gray-900 font-semibold">{formatDateStr(dateStr)}</span>
                </div>
            )
        }
        if (st === "hoje") {
            return (
                <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-blue-600 font-normal">{label}</span>
                    <span className="text-gray-900 font-semibold">{formatDateStr(dateStr)}</span>
                </div>
            )
        }
        return (
            <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-gray-400 font-normal">{label}</span>
                <span className="text-gray-900 font-semibold">{formatDateStr(dateStr)}</span>
            </div>
        )
    }

    const ultimaDoseDate =
        doseAnualAplicada?.dataAplicacao ||
        dose2?.dataAplicacao ||
        dose1?.dataAplicacao ||
        item.dataEntrada

    const proximaDoseAgendada = dosesAgendadas
        .filter((d) => d.dataPrevista)
        .sort((a, b) => new Date(a.dataPrevista).getTime() - new Date(b.dataPrevista).getTime())[0]

    const proximaDoseDate =
        item.dataProximaDose ||
        proximaDoseAgendada?.dataPrevista ||
        (ultimaDoseDate ? addDays(ultimaDoseDate, 365) : "")

    return (
        <HorizontalCard
            leftBorderClass={borderClass}
            subtitle={<span className="text-xs font-semibold text-gray-400">#{item.numeroRegistro}</span>}
            title={<span className="text-base font-bold text-gray-900 leading-tight">{item.especieNome || "Espécie não informada"}</span>}
            badge={badgeNode}
            onClick={onClick}
        >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                {/* Data de Entrada */}
                <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-normal">Entrada:</span>
                    <span className="text-gray-900 font-semibold">{formatDateStr(item.dataEntrada)}</span>
                </div>

                {!isManutencao ? (
                    <>
                        {renderDoseIconAndText("1ª Dose:", date1a, statusDose1)}
                        {renderDoseIconAndText("2ª Dose:", date2a, statusDose2)}
                        {renderDoseIconAndText("Dose anual:", dateAnual, "pendente")}
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-gray-400 font-normal">Ultima dose:</span>
                            <span className="text-gray-900 font-semibold">{formatDateStr(ultimaDoseDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-gray-400 font-normal">Próxima dose:</span>
                            <span className="text-gray-900 font-semibold">{formatDateStr(proximaDoseDate)}</span>
                        </div>
                    </>
                )}
            </div>
        </HorizontalCard>
    )
}
