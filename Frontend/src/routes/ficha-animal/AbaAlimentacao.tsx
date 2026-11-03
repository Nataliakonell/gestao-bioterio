import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { HorizontalCard } from "@/components/horizontal-card"
import { PaginationBar } from "@/components/pagination-bar"
import { getAlimentacoes } from "@/services/AlimentacaoService"
import { TipoRefeicao } from "../Alimentacao/RegistroAlimentacao"
import { usePermissions } from "@/contexts/PermissionsContext"

function ExpandableText({
    text,
    maxChars = 100,
    className = "",
}: {
    text: string
    maxChars?: number
    className?: string
}) {
    const [expanded, setExpanded] = useState(false)

    if (!text || text.length <= maxChars) {
        return <span className={className}>{text}</span>
    }

    const displayText = expanded ? text : `${text.slice(0, maxChars)}...`

    return (
        <span className={className}>
            <span>{displayText} </span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(!expanded)
                }}
                className="inline-block text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline ml-1 cursor-pointer select-none"
            >
                {expanded ? "Ver menos" : "Ver mais..."}
            </button>
        </span>
    )
}

interface AbaAlimentacaoProps {
    animalId: number
}

export function AbaAlimentacao({ animalId }: AbaAlimentacaoProps) {
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()
    const [alimentacoes, setAlimentacoes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        setLoading(true)
        getAlimentacoes({ animalId, page, pageSize })
            .then((data) => {
                const sorted = [...data.items].sort((a, b) => b.id - a.id)
                setAlimentacoes(sorted)
                setTotalCount(data.totalCount)
            })
            .catch((err) => console.error("Erro ao buscar alimentações do animal:", err))
            .finally(() => setLoading(false))
    }, [animalId, page, pageSize])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
            </div>
        )
    }

    const getUnidadeAlimentacao = (alimentacao: any) => {
        const temSonda = alimentacao.refeicoes?.some(
            (r: any) => Number(r.tipoRefeicao) === TipoRefeicao.ViaSonda
        )
        return temSonda ? "ml" : "g"
    }

    return (
        <div className="flex flex-col gap-4">
            {alimentacoes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    Nenhum registro de alimentação encontrado para este animal.
                </div>
            ) : (
                alimentacoes.map((item) => {
                    const unidade = getUnidadeAlimentacao(item)
                    const saldo = Number(item.saldo)
                    const isAlimentada = item.status === 1

                    return (
                        <HorizontalCard
                            key={item.id}
                            title={
                                item.dataAlimentacao
                                    ? new Date(item.dataAlimentacao).toLocaleDateString("pt-BR")
                                    : "-"
                            }
                            badge={
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        isAlimentada
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {isAlimentada ? "Alimentada" : "Pendente"}
                                </span>
                            }
                            leftBorderClass={isAlimentada ? "border-l-green-500" : "border-l-red-500"}
                            infoBlocks={[
                                {
                                    label: "Peso",
                                    value: item.biometriaAnimal?.peso ?? "-",
                                },
                                {
                                    label: "Recomendado",
                                    value: item.pesoRecomendado ? `${item.pesoRecomendado} ${unidade}` : "-",
                                },
                                {
                                    label: "Ofertado",
                                    value: item.totalOfertado ? `${item.totalOfertado} ${unidade}` : "-",
                                },
                                {
                                    label: "Saldo",
                                    value: isNaN(saldo)
                                        ? "-"
                                        : `${saldo.toFixed(1)} ${unidade}`,
                                },
                            ]}
                            children={
                                item.observacoes ? (
                                    <div className="text-xs text-slate-600">
                                        <span className="font-semibold text-slate-800">Obs: </span>
                                        <ExpandableText text={item.observacoes} maxChars={80} />
                                    </div>
                                ) : undefined
                            }
                            onClick={hasPermission("Alimentação", "Editar") ? () =>
                                navigate(`/alimentacao/registrar-alimentacao/${item.id}`)
                            : undefined}
                        />
                    )
                })
            )}

            {alimentacoes.length > 0 && (
                <PaginationBar
                    currentPage={page}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setPage(1)
                    }}
                />
            )}
        </div>
    )
}
