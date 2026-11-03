import { ReactNode } from "react"
import { DiasSemana } from "./DiasSemanas"
import { Clock } from "lucide-react"

interface CardInfoItem {
    icon?: ReactNode
    label: string
    value: ReactNode
}

interface DiaSemanaStatus {
    Dia: string
    Status: string
}

interface CardVisaoGeralProps {
    titulo: string
    subtitulo?: string
    badge?: ReactNode
    informacoes: CardInfoItem[]
    frequencia?: string
    tipoFrequencia?: string
    diasSemanaProgramado?: string[]
    diasSemanaStatus?: DiaSemanaStatus[]
    footer?: ReactNode
    onClick?: () => void
}

export function CardVisaoGeral({
    titulo,
    subtitulo,
    badge,
    informacoes,
    frequencia,
    tipoFrequencia,
    diasSemanaProgramado,
    diasSemanaStatus,
    footer,
    onClick,
}: CardVisaoGeralProps) {
    return (
        <div
            onClick={onClick}
            className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm transition-all hover:shadow-md"
        >
            <div>
                <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500">
                        {subtitulo}
                    </span>
                    {badge}
                </div>

                <h3 className="mt-1 text-base font-bold text-gray-800 group-hover:text-blue-800 transition-colors">
                    {titulo}
                </h3>

                <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                    {tipoFrequencia === "DiasDaSemana" && diasSemanaProgramado ? (
                        <div className="flex items-start gap-2">
                            <Clock className="mt-0.5 h-3.5 w-3.5 text-gray-400" />

                            <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-500 whitespace-nowrap">
                                    Freq.:
                                </span>

                                <DiasSemana diasSelecionados={diasSemanaProgramado} diasSemanaStatus={diasSemanaStatus} />
                            </div>
                        </div>
                    ) : frequencia ? (
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                                Freq.: <strong>{frequencia}</strong>
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 space-y-1.5">
                {informacoes.map((info) => (
                    <div
                        key={info.label}
                        className="flex items-center gap-2 text-xs text-gray-600"
                    >
                        {info.icon}
                        <span className="text-gray-500">{info.label}:</span>
                        <strong>{info.value}</strong>
                    </div>
                ))}
            </div>

            {footer && (
                <div className="mt-4 rounded-lg bg-gray-50/80 p-2">
                    {footer}
                </div>
            )}
        </div>
    )
}
