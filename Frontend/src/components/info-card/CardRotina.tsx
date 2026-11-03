import { type AnimalRotinaStatusVm, type DiaSemanaStatusVm, StatusRotina } from "@/services/RotinaAnimalService"
import {
    Calendar,
    CircleAlert,
    CircleCheck,
    CircleX,
} from "lucide-react"

const statusConfig: Record<number, { label: string; bg: string; text: string }> = {
    [StatusRotina.SemRegistro]: { label: "Sem registro", bg: "bg-gray-100", text: "text-gray-700" },
    [StatusRotina.Hoje]: { label: "Hoje", bg: "bg-blue-100", text: "text-blue-700" },
    [StatusRotina.Proximo]: { label: "Próximo", bg: "bg-yellow-100", text: "text-yellow-700" },
    [StatusRotina.Concluido]: { label: "Concluído", bg: "bg-green-100", text: "text-green-700" },
    [StatusRotina.EmDia]: { label: "Em dia", bg: "bg-green-100", text: "text-green-700" },
    [StatusRotina.Atrasado]: { label: "Atrasado", bg: "bg-red-100", text: "text-red-700" },
    [StatusRotina.NaoAlimentado]: { label: "Não alimentado", bg: "bg-orange-100", text: "text-orange-700" },
}

const dayShortName: Record<string, string> = {
    "Domingo": "Dom",
    "Segunda": "Seg",
    "Terça": "Ter",
    "Quarta": "Qua",
    "Quinta": "Qui",
    "Sexta": "Sex",
    "Sábado": "Sáb",
}

const dayStatusLabel: Record<string, { label: string; icon: React.ReactNode }> = {
    hoje: {
        label: "Hoje",
        icon: <CircleAlert className="h-3.5 w-3.5 text-blue-600" />,
    },
    agendado: {
        label: "Agendado",
        icon: <CircleAlert className="h-3.5 w-3.5 text-gray-400" />,
    },
    concluido: {
        label: "Concluído",
        icon: <CircleCheck className="h-3.5 w-3.5 text-green-600" />,
    },
    naoAlimentado: {
        label: "Não alimentado",
        icon: <CircleX className="h-3.5 w-3.5 text-red-500" />,
    },
    atrasado: {
        label: "Atrasado",
        icon: <CircleX className="h-3.5 w-3.5 text-red-500" />,
    },
}

interface CardRotinaProps {
    item: AnimalRotinaStatusVm
    onClick?: () => void
}
export function CardRotina({ item, onClick }: CardRotinaProps) {

    const DiasSemanaBadge = ({ dia, status }: DiaSemanaStatusVm) => {
        const short = dayShortName[dia] ?? dia.slice(0, 3)
        const cfg = dayStatusLabel[status] ?? { label: status, icon: null }
        return (
            <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${status === "hoje"
                        ? "text-blue-700"
                        : status === "concluido"
                            ? "text-green-700"
                            : status === "naoAlimentado" || status === "atrasado"
                                ? "text-red-600"
                                : "text-gray-500"
                    }`}
                title={cfg.label}
            >
                {cfg.icon}
                <span>{short}</span>
            </span>
        )
    }

    const alimentacaoStatus = item.alimentacao?.status
    const cfg = alimentacaoStatus ? statusConfig[alimentacaoStatus] : null

    const statusLabel = cfg?.label ?? "-"
    const statusBg = cfg?.bg ?? "bg-gray-100"
    const statusText = cfg?.text ?? "text-gray-700"

    const ultimaData = item.alimentacao?.ultimaData
        ? new Date(item.alimentacao.ultimaData).toLocaleDateString("pt-BR")
        : "-"

    const proximaData = item.alimentacao?.proximaData
        ? new Date(item.alimentacao.proximaData).toLocaleDateString("pt-BR")
        : "-"

    const frequencia = item.alimentacao?.frequenciaDias
        ? `${item.alimentacao.frequenciaDias} dias`
        : "-"

    const diasSemanaStatus = item.alimentacao?.diasSemanaStatus

    return (
        <div
            onClick={onClick}
            className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 border-l-4 border-l-blue-600 bg-white p-4 shadow-sm transition-all hover:shadow-md"
        >
            <div>
                <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500">
                        #{item.numeroRegistro}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBg} ${statusText}`}>
                        {statusLabel}
                    </span>
                </div>

                <h3 className="mt-1 text-base font-bold text-gray-800 group-hover:text-blue-800 transition-colors">
                    {item.especieNome}
                </h3>
                <p className="text-xs text-gray-500">{item.nomeAnimal || item.especieNome}</p>
            </div>

            {(!diasSemanaStatus || diasSemanaStatus.length === 0) && (
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-50/80 p-2 text-xs">
                    <div>
                        <span className="block text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                            ÚLTIMA
                        </span>
                        <div className="mt-0.5 flex items-center gap-1 font-medium text-gray-700">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{ultimaData}</span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                            PRÓXIMA
                        </span>
                        <div className="mt-0.5 flex items-center gap-1 font-medium text-gray-700">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{proximaData}</span>
                        </div>
                    </div>
                </div>
            )}

            {diasSemanaStatus && diasSemanaStatus.length > 0 && (
                <div className="mt-3 rounded-lg border border-gray-100 bg-white p-2">
                    <span className="block text-[10px] font-semibold tracking-wider text-gray-400 uppercase mb-1.5">
                        DIAS DA SEMANA
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {diasSemanaStatus.map(d => (
                            <DiasSemanaBadge key={d.dia} dia={d.dia} status={d.status} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
