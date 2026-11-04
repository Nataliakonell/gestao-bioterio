import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, ChevronDown, ChevronRight, Check, Edit2 } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateAlimentacao } from "@/services/AlimentacaoService"
import { TipoRefeicao, SituacaoRefeicao } from "./RegistroAlimentacao"
import { usePermissions } from "@/contexts/PermissionsContext"

const TIPO_REFEICAO_NOMES: Record<number, string> = {
    [TipoRefeicao.Roedor]: "Roedor",
    [TipoRefeicao.Ave]: "Ave",
    [TipoRefeicao.Peixe]: "Peixe",
    [TipoRefeicao.Insetos]: "Insetos",
    [TipoRefeicao.Carne_Vermelha]: "Carne Vermelha",
    [TipoRefeicao.Frutas]: "Frutas",
    [TipoRefeicao.Legumes]: "Legumes",
    [TipoRefeicao.Vegetais]: "Vegetais",
    [TipoRefeicao.Racao]: "Ração",
    [TipoRefeicao.Ovo]: "Ovo",
    [TipoRefeicao.ViaSonda]: "Via Sonda",
}

export interface TabelaGeralAlimentacaoProps {
    data: any[]
    loading: boolean
    page: number
    pageSize: number
    totalCount: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onDataUpdated: () => Promise<void> | void
}

export function TabelaGeralAlimentacao({
    data,
    loading,
    page,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    onDataUpdated,
}: TabelaGeralAlimentacaoProps) {
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
    const [selectedRefeicaoIds, setSelectedRefeicaoIds] = useState<Set<number>>(new Set())
    const [loteSituacaoSelecionada, setLoteSituacaoSelecionada] = useState<string>("1") // 1 = Aceitou
    const [atualizandoLote, setAtualizandoLote] = useState(false)

    // Coletar todos os IDs de refeições válidas da página atual
    const todasRefeicoesIds = React.useMemo(() => {
        const ids: number[] = []
        data.forEach((item) => {
            ;(item.refeicoes || []).forEach((r: any) => {
                if (r.id) ids.push(r.id)
            })
        })
        return ids
    }, [data])

    const todasMarcadas = todasRefeicoesIds.length > 0 && todasRefeicoesIds.every((id) => selectedRefeicaoIds.has(id))

    // Alternar seleção de TODAS as refeições da tabela
    const handleToggleSelectAll = () => {
        setSelectedRefeicaoIds((prev) => {
            const next = new Set(prev)
            if (todasMarcadas) {
                todasRefeicoesIds.forEach((id) => next.delete(id))
            } else {
                todasRefeicoesIds.forEach((id) => next.add(id))
            }
            return next
        })
    }

    // Alternar expansão do acordeão por alimentação
    const toggleExpand = (id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    // Seleção de todas as refeições de um animal
    const toggleSelectAnimalRefeicoes = (alimentacao: any) => {
        const refs = alimentacao.refeicoes || []
        const refIds = refs.map((r: any) => r.id).filter(Boolean)
        const allSelected = refIds.length > 0 && refIds.every((id: number) => selectedRefeicaoIds.has(id))

        setSelectedRefeicaoIds((prev) => {
            const next = new Set(prev)
            if (allSelected) {
                refIds.forEach((id: number) => next.delete(id))
            } else {
                refIds.forEach((id: number) => next.add(id))
            }
            return next
        })
    }

    // Seleção individual de refeição
    const toggleSelectRefeicao = (refeicaoId: number) => {
        setSelectedRefeicaoIds((prev) => {
            const next = new Set(prev)
            if (next.has(refeicaoId)) next.delete(refeicaoId)
            else next.add(refeicaoId)
            return next
        })
    }

    // Selecionar pendentes na página atual
    const handleSelecionarPendentes = () => {
        const pendentesIds: number[] = []
        data.forEach((item) => {
            ;(item.refeicoes || []).forEach((r: any) => {
                if (r.id && (r.situacaoRefeicao === SituacaoRefeicao.Pendente || r.situacaoRefeicao === 0)) {
                    pendentesIds.push(r.id)
                }
            })
        })

        if (pendentesIds.length === 0) {
            toast.info("Não há refeições pendentes na página atual.")
            return
        }

        setSelectedRefeicaoIds(new Set(pendentesIds))
        toast.success(`${pendentesIds.length} refeições pendentes selecionadas!`)
    }

    // Atualizar situação em lote das refeições selecionadas
    const handleAtualizarStatusEmLote = async () => {
        if (selectedRefeicaoIds.size === 0) {
            toast.warning("Selecione ao menos uma refeição para atualizar.")
            return
        }

        const novaSituacao = Number(loteSituacaoSelecionada)

        try {
            setAtualizandoLote(true)
            const alimentacoesAfetadas = data.filter((item) =>
                (item.refeicoes || []).some((r: any) => selectedRefeicaoIds.has(r.id))
            )

            let alterados = 0
            for (const al of alimentacoesAfetadas) {
                const refeicoesAtualizadas = (al.refeicoes || []).map((r: any) => {
                    if (selectedRefeicaoIds.has(r.id)) {
                        alterados++
                        return {
                            id: r.id,
                            tipoRefeicao: r.tipoRefeicao,
                            pesoRefeicao: r.pesoRefeicao,
                            situacaoRefeicao: novaSituacao,
                        }
                    }
                    return {
                        id: r.id,
                        tipoRefeicao: r.tipoRefeicao,
                        pesoRefeicao: r.pesoRefeicao,
                        situacaoRefeicao: r.situacaoRefeicao,
                    }
                })

                await updateAlimentacao(al.id, {
                    animalId: al.animalId,
                    dataAlimentacao: al.dataAlimentacao,
                    peso: al.biometriaAnimal?.peso || 0,
                    pesoRecomendado: al.pesoRecomendado,
                    porcentagemPesoRecomendado: al.porcentagemPesoRecomendado || 20,
                    refeicoes: refeicoesAtualizadas,
                    observacoes: al.observacoes,
                })
            }

            toast.success(`${alterados} refeições atualizadas com sucesso!`)
            setSelectedRefeicaoIds(new Set())
            await onDataUpdated()
        } catch (err: any) {
            console.error("Erro ao atualizar em lote:", err)
            toast.error(err.message || "Erro ao atualizar status das refeições.")
        } finally {
            setAtualizandoLote(false)
        }
    }

    // Atualização de situação pontual de uma única refeição
    const handleMudarSituacaoIndividual = async (alimentacao: any, refeicaoId: number, novaSituacao: number) => {
        try {
            const refeicoesAtualizadas = (alimentacao.refeicoes || []).map((r: any) => ({
                id: r.id,
                tipoRefeicao: r.tipoRefeicao,
                pesoRefeicao: r.pesoRefeicao,
                situacaoRefeicao: r.id === refeicaoId ? novaSituacao : r.situacaoRefeicao,
            }))

            await updateAlimentacao(alimentacao.id, {
                animalId: alimentacao.animalId,
                dataAlimentacao: alimentacao.dataAlimentacao,
                peso: alimentacao.biometriaAnimal?.peso || 0,
                pesoRecomendado: alimentacao.pesoRecomendado,
                porcentagemPesoRecomendado: alimentacao.porcentagemPesoRecomendado || 20,
                refeicoes: refeicoesAtualizadas,
                observacoes: alimentacao.observacoes,
            })

            toast.success("Situação da refeição atualizada.")
            await onDataUpdated()
        } catch (err: any) {
            console.error("Erro ao mudar situação:", err)
            toast.error(err.message || "Erro ao atualizar situação da refeição.")
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            header: (
                <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                    <Checkbox
                        checked={todasMarcadas}
                        onCheckedChange={handleToggleSelectAll}
                        aria-label="Marcar todas as refeições"
                    />
                </div>
            ),
            width: "48px",
            headerClassName: "text-center w-12",
            cellClassName: "text-center w-12",
            cell: (item) => {
                const refeicoes = item.refeicoes || []
                const refIds = refeicoes.map((r: any) => r.id).filter(Boolean)
                const allChecked = refIds.length > 0 && refIds.every((id: number) => selectedRefeicaoIds.has(id))

                return (
                    <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                        <Checkbox
                            checked={allChecked}
                            onCheckedChange={() => toggleSelectAnimalRefeicoes(item)}
                            aria-label={`Selecionar refeições do animal ${item.numeroRegistro}`}
                        />
                    </div>
                )
            },
        },
        {
            header: "Animal / Espécie",
            accessorKey: "especieNome",
            sortable: true,
            cell: (item) => (
                <div>
                    <div className="font-bold text-foreground text-sm">
                        #{item.numeroRegistro}
                    </div>
                    <div className="text-xs italic text-muted-foreground">
                        {item.especieNome}
                    </div>
                </div>
            ),
        },
        {
            header: "Data",
            accessorKey: "dataAlimentacao",
            sortable: true,
            cell: (item) => (
                <div className="text-xs">
                    <div className="font-medium text-foreground">
                        {item.dataAlimentacao ? new Date(item.dataAlimentacao).toLocaleDateString() : "—"}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                    </div>
                </div>
            ),
        },
        {
            header: "Peso / Sugerido (g)",
            cell: (item) => (
                <div className="text-xs">
                    <div className="font-medium">{item.pesoAnimal ?? "—"} g</div>
                    <div className="text-muted-foreground text-[11px]">
                        {item.pesoRecomendado} g · {item.porcentagemPesoRecomendado ?? 20}%
                    </div>
                </div>
            ),
        },
        {
            header: "Ofertado (g)",
            cell: (item) => {
                const refeicoes = item.refeicoes || []
                const percentualOfertado =
                    item.pesoAnimal && Number(item.pesoAnimal) > 0
                        ? (((item.totalOfertado || 0) / Number(item.pesoAnimal)) * 100).toFixed(1)
                        : "0.0"

                return (
                    <div className="text-xs">
                        <div className="font-bold text-foreground">
                            {(item.totalOfertado || 0).toFixed(1)} g
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                            {refeicoes.length} refeição{refeicoes.length > 1 ? "ões" : ""} · {percentualOfertado}%
                        </div>
                    </div>
                )
            },
        },
        {
            header: "Resultado",
            cell: (item) => {
                const isAlimentada = item.status === "Alimentada" || item.status === 1
                return (
                    <div className="flex flex-col gap-1 items-start">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isAlimentada
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {isAlimentada ? "Alimentada" : "Pendente"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Consumido: {(item.totalConsumido || 0).toFixed(1)} g
                        </span>
                    </div>
                )
            },
        },
        {
            header: "",
            width: "48px",
            headerClassName: "text-center w-12",
            cellClassName: "text-center w-12",
            cell: (item) => {
                const isExpanded = expandedIds.has(item.id)
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(item.id)
                        }}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                )
            },
        },
    ]

    const renderExpandedRow = (item: any) => {
        const refeicoes = item.refeicoes || []
        const naoConsumido = (item.totalOfertado || 0) - (item.totalConsumido || 0)

        return (
            <div className="p-4 pl-12 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Refeições ofertadas ({refeicoes.length})
                </div>

                <div className="divide-y rounded-lg border bg-background">
                    {refeicoes.map((r: any, rIdx: number) => {
                        const isRefChecked = selectedRefeicaoIds.has(r.id)
                        const nomeTipo = TIPO_REFEICAO_NOMES[r.tipoRefeicao] || "Roedor"

                        return (
                            <div
                                key={r.id || rIdx}
                                className="flex flex-wrap items-center justify-between p-3 gap-3 text-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={isRefChecked}
                                        onCheckedChange={() => toggleSelectRefeicao(r.id)}
                                    />
                                    <span className="font-semibold text-foreground">
                                        Refeição {rIdx + 1}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {nomeTipo}
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {r.pesoRefeicao} g
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Select
                                        value={String(r.situacaoRefeicao)}
                                        onValueChange={(val) =>
                                            handleMudarSituacaoIndividual(item, r.id, Number(val))
                                        }
                                    >
                                        <SelectTrigger className="w-32 h-7 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={String(SituacaoRefeicao.Pendente)}>
                                                Pendente
                                            </SelectItem>
                                            <SelectItem value={String(SituacaoRefeicao.Aceitou)}>
                                                Aceitou
                                            </SelectItem>
                                            <SelectItem value={String(SituacaoRefeicao.Negou)}>
                                                Negou
                                            </SelectItem>
                                            <SelectItem value={String(SituacaoRefeicao.Regurgitou)}>
                                                Regurgitou
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-brand hover:text-brand/80"
                                        onClick={() =>
                                            navigate(`/alimentacao/registrar-alimentacao/${item.id}`)
                                        }
                                    >
                                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="text-xs text-muted-foreground flex items-center justify-between pt-1">
                    <span>
                        Não consumido: <strong>{naoConsumido.toFixed(1)} g</strong>
                    </span>
                    <span>
                        Saldo nutricional: <strong>{Number(item.saldo || 0).toFixed(1)} g</strong>
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Barra de Ação em Lote (Passo 4 - Anotação de Resultados / Consumo) */}
            {hasPermission("Alimentação", "Editar") && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card border rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                            {selectedRefeicaoIds.size} refeições selecionadas
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select
                            value={loteSituacaoSelecionada}
                            onValueChange={setLoteSituacaoSelecionada}
                        >
                            <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={String(SituacaoRefeicao.Pendente)}>Pendente</SelectItem>
                                <SelectItem value={String(SituacaoRefeicao.Aceitou)}>Aceitou</SelectItem>
                                <SelectItem value={String(SituacaoRefeicao.Negou)}>Negou</SelectItem>
                                <SelectItem value={String(SituacaoRefeicao.Regurgitou)}>Regurgitou</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            size="sm"
                            disabled={selectedRefeicaoIds.size === 0 || atualizandoLote}
                            onClick={handleAtualizarStatusEmLote}
                            className="h-8 text-xs bg-brand hover:bg-brand/90 text-white flex items-center gap-1.5"
                        >
                            {atualizandoLote ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Check className="h-3.5 w-3.5" />
                            )}
                            Atualizar status
                        </Button>
                    </div>
                </div>
            )}

            {/* Tabela de Alimentações com DataTable */}
            <DataTable
                data={data}
                columns={columns}
                loading={loading}
                emptyMessage="Nenhuma alimentação encontrada."
                onRowClick={(item) => toggleExpand(item.id)}
                isRowExpanded={(item) => expandedIds.has(item.id)}
                renderExpandedRow={renderExpandedRow}
                rowClassName={(item) => (expandedIds.has(item.id) ? "bg-muted/15" : "")}
                serverPagination={{
                    page,
                    pageSize,
                    totalCount,
                    onPageChange,
                    onPageSizeChange,
                }}
            />
        </div>
    )
}
