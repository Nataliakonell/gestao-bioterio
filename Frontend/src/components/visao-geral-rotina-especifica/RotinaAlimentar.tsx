import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    type AnimalRotinaStatusVm,
    StatusRotina,
} from "@/services/RotinaAnimalService"
import { HorizontalCard } from "@/components/horizontal-card"
import { PaginationBar } from "@/components/pagination-bar"
import { Calendar, CircleAlert, CircleCheck, CircleX, Circle } from "lucide-react"
import type { DateRange } from "react-day-picker"

const dayShortName: Record<string, string> = {
    Domingo: "Dom",
    Segunda: "Seg",
    Terça: "Ter",
    Quarta: "Qua",
    Quinta: "Qui",
    Sexta: "Sex",
    Sábado: "Sáb",
}

const dayStatusIcon: Record<string, { icon: typeof CircleAlert; color: string }> = {
    hoje: { icon: CircleAlert, color: "text-blue-600" },
    agendado: { icon: CircleAlert, color: "text-gray-800" },
    concluido: { icon: CircleCheck, color: "text-green-600" },
    naoAlimentado: { icon: CircleX, color: "text-red-500" },
    atrasado: { icon: CircleX, color: "text-red-500" },
}

const statusStyle: Record<number, { label: string; bg: string; text: string; border: string }> = {
    [StatusRotina.SemRegistro]: { label: "Sem registro", bg: "bg-gray-100", text: "text-gray-700", border: "border-l-blue-600" },
    [StatusRotina.Hoje]: { label: "Hoje", bg: "bg-blue-100", text: "text-blue-700", border: "border-l-blue-600" },
    [StatusRotina.Proximo]: { label: "Próximo", bg: "bg-yellow-100", text: "text-yellow-700", border: "border-l-yellow-500" },
    [StatusRotina.Concluido]: { label: "Concluído", bg: "bg-green-100", text: "text-green-700", border: "border-l-green-500" },
    [StatusRotina.EmDia]: { label: "Em dia", bg: "bg-green-100", text: "text-green-700", border: "border-l-green-500" },
    [StatusRotina.Atrasado]: { label: "Atrasado", bg: "bg-red-100", text: "text-red-700", border: "border-l-red-500" },
    [StatusRotina.NaoAlimentado]: { label: "Não alimentado", bg: "bg-orange-100", text: "text-orange-700", border: "border-l-orange-500" },
}

const FASE_LABEL: Record<number, string> = {
    1: "Filhote",
    2: "Jovem",
    3: "Adulto",
    4: "Todos",
}

function formatFrequencia(item: AnimalRotinaStatusVm): string {
    const rotina = item.alimentacao
    if (!rotina) return "-"
    if (rotina.tipoFrequencia === 1) return "Diário"
    if (rotina.tipoFrequencia === 2) return `A cada ${rotina.frequenciaDias} dia(s)`
    return "-"
}

interface TabelaRotinaAlimentarProps {
    search: string
    selectedEspecie: string
    selectedStatus: string[]
    dateRange?: DateRange
    data: AnimalRotinaStatusVm[]
    serverPage: number
    serverPageSize: number
    serverTotalCount: number
    onPaginationChange: (page: number, pageSize: number) => void
    onRowClick?: (item: AnimalRotinaStatusVm) => void
}

export function TabelaRotinaAlimentar({
    search: _search,
    selectedEspecie: _selectedEspecie,
    selectedStatus: _selectedStatus,
    dateRange: _dateRange,
    data,
    serverPage,
    serverPageSize,
    serverTotalCount,
    onPaginationChange,
    onRowClick,
}: TabelaRotinaAlimentarProps) {
    const navigate = useNavigate()

    const handlePageChange = (page: number) => onPaginationChange(page, serverPageSize)
    const handlePageSizeChange = (size: number) => onPaginationChange(1, size)

    return (
        <div className="flex flex-col gap-4">
            {data.map((item) => {
                const rotina = item.alimentacao
                const cfg = rotina?.status ? statusStyle[rotina.status] : statusStyle[StatusRotina.SemRegistro]
                const borderClass = cfg?.border ?? "border-l-blue-600"
                const isDiasSemana = rotina?.tipoFrequencia === 3

                const infoBlocks: { label: string; value: string }[] = []

                if (rotina?.frequenciaDias && !isDiasSemana) {
                    infoBlocks.push({ label: "Frequência", value: formatFrequencia(item) })
                }

                if (!isDiasSemana) {
                    infoBlocks.push({
                        label: "Última",
                        value: rotina?.ultimaData
                            ? new Date(rotina.ultimaData).toLocaleDateString("pt-BR")
                            : "-",
                    })
                    infoBlocks.push({
                        label: "Próxima",
                        value: rotina?.proximaData
                            ? new Date(rotina.proximaData).toLocaleDateString("pt-BR")
                            : "-",
                    })
                }

                return (
                    <HorizontalCard
                        key={item.animalId}
                        title={item.especieNome}           
                        subtitle={`#${item.numeroRegistro} · ${FASE_LABEL[item.faseDeVida] ?? item.faseDeVida}`}
                        badge={
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg?.bg ?? "bg-gray-100"} ${cfg?.text ?? "text-gray-700"}`}
                            >
                                {cfg?.label ?? "-"}
                            </span>
                        }
                        leftBorderClass={borderClass}
                        infoBlocks={infoBlocks}
                        onClick={onRowClick ? () => onRowClick(item) : undefined}
                    >
                        {isDiasSemana && rotina?.diasSemanaStatus && rotina.diasSemanaStatus.length > 0 && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                                <Calendar className="mr-1 h-3.5 w-3.5 text-gray-400" />
                                {rotina.diasSemanaStatus.map((d) => {
                                    const dayStatus = dayStatusIcon[d.status]
                                    const Icon = dayStatus?.icon ?? Circle
                                    const color = dayStatus?.color ?? "text-gray-400"
                                    return (
                                        <span
                                            key={d.dia}
                                            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium ${color}`}
                                            title={d.status}
                                        >
                                            <Icon className="h-3 w-3" />
                                            {dayShortName[d.dia] ?? d.dia.slice(0, 3)}
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                    </HorizontalCard>
                )
            })}

            <PaginationBar
                currentPage={serverPage}
                pageSize={serverPageSize}
                totalCount={serverTotalCount}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    )
}
