import { CircleAlert, CircleCheck, CircleX, Circle } from "lucide-react"

const diasSemana = [
    { nome: "Dom", valor: "Domingo" },
    { nome: "Seg", valor: "Segunda" },
    { nome: "Ter", valor: "Terça" },
    { nome: "Qua", valor: "Quarta" },
    { nome: "Qui", valor: "Quinta" },
    { nome: "Sex", valor: "Sexta" },
    { nome: "Sáb", valor: "Sábado" },
]

interface DiaSemanaStatus {
    Dia: string
    Status: string
}

interface DiasSemanaProps {
    diasSelecionados: string[]
    diasSemanaStatus?: DiaSemanaStatus[]
}

const statusConfig: Record<string, { icon: typeof CircleAlert; color: string; bg: string }> = {
    concluido: { icon: CircleCheck, color: "text-green-600", bg: "bg-green-50" },
    hoje: { icon: CircleAlert, color: "text-blue-600", bg: "bg-blue-50" },
    agendado: { icon: CircleAlert, color: "text-gray-400", bg: "bg-gray-50" },
    naoAlimentado: { icon: CircleX, color: "text-red-500", bg: "bg-red-50" },
}

export function DiasSemana({ diasSelecionados, diasSemanaStatus }: DiasSemanaProps) {
    const statusMap = new Map(diasSemanaStatus?.map(s => [s.Dia, s.Status]) ?? [])

    return (
        <div className="flex flex-wrap gap-2">
            {diasSemana
                .filter((dia) => diasSelecionados.includes(dia.valor))
                .map((dia) => {
                    const status = statusMap.get(dia.valor)
                    const config = status ? statusConfig[status] : statusConfig.agendado
                    const Icon = config.icon

                    return (
                        <span
                            key={dia.valor}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${config.bg} ${config.color}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {dia.nome}
                        </span>
                    )
                })}
        </div>
    )
}
