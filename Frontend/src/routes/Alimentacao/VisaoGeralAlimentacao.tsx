import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { getAlimentacoes, updateAlimentacao, type AlimentacaoResponse, type RefeicaoResponse } from "@/services/AlimentacaoService"
import { PaginationBar } from "@/components/pagination-bar"
import { Loader2, ChevronDown, ChevronRight, Layers, Check, Edit2 } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { TipoRefeicao, SituacaoRefeicao } from "./RegistroAlimentacao"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { usePermissions } from "@/contexts/PermissionsContext"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const normalizeStr = (str: string | null | undefined) => {
    if (!str) return ""
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

const getUnidadeAlimentacao = (alimentacao: any) => {
    const temSonda = alimentacao.refeicoes?.some(
        (r: any) => Number(r.tipoRefeicao) === TipoRefeicao.ViaSonda
    )
    return temSonda ? "ml" : "g"
}

export enum FaseDeVida {
    Filhote = 1,
    Jovem = 2,
    Adulto = 3,
}

const faseDeVidaMap: Record<string, string> = {
    "1": "Filhote",
    "2": "Jovem",
    "3": "Adulto",
    Filhote: "Filhote",
    Jovem: "Jovem",
    Adulto: "Adulto",
}

const faseDeVidaIdMap: Record<string, string> = {
    "1": "1",
    "2": "2",
    "3": "3",
    Filhote: "1",
    Jovem: "2",
    Adulto: "3",
}

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

export default function VisaoGeralAlimentacao() {
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [selectedEspecie, setSelectedEspecie] = useState<string>("")
    
    const [allEspecies, setAllEspecies] = useState<EspecieLookupVm[]>([])
    const [selectedFaseDeVida, setSelectedFaseDeVida] = useState<string[]>([])

    const [sortField, setSortField] = useState<string>("especieNome")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const [statusCounts, setStatusCounts] = useState({
        alimentada: 0,
        pendente: 0,
    })

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    // Estado do Acordeão e Seleção em Lote (Passo 4)
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
    const [selectedRefeicaoIds, setSelectedRefeicaoIds] = useState<Set<number>>(new Set())
    const [loteSituacaoSelecionada, setLoteSituacaoSelecionada] = useState<string>("1") // 1 = Aceitou
    const [atualizandoLote, setAtualizandoLote] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput), 400)
        return () => clearTimeout(timer)
    }, [searchInput])

    const formatDateParam = (d?: Date) => {
        if (!d) return undefined
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
    }

    const fetchStatusCounts = useCallback(async () => {
        try {
            const response = await getAlimentacoes({
                page: 1,
                pageSize: 10000,
                search,
                faseDeVida: selectedFaseDeVida.length > 0 ? selectedFaseDeVida.join(",") : undefined,
                especieId: selectedEspecie && selectedEspecie !== "all" ? Number(selectedEspecie) : undefined,
                dataInicial: formatDateParam(dateRange?.from),
                dataFinal: formatDateParam(dateRange?.to ?? dateRange?.from),
            })
            let alimentada = 0
            let pendente = 0
            response.items.forEach((item: any) => {
                if (item.status === 1 || item.status === "Alimentada" || item.status === "1") {
                    alimentada++
                } else {
                    pendente++
                }
            })
            setStatusCounts({ alimentada, pendente })
        } catch (error) {
            console.error("Erro ao buscar contagem de status de alimentação", error)
        }
    }, [search, selectedFaseDeVida, selectedEspecie, dateRange])

    useEffect(() => {
        fetchStatusCounts()
    }, [fetchStatusCounts])

    const fetchHistorico = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getAlimentacoes({
                page,
                pageSize,
                search,
                faseDeVida: selectedFaseDeVida.length > 0 ? selectedFaseDeVida.join(",") : undefined,
                especieId: selectedEspecie && selectedEspecie !== "all" ? Number(selectedEspecie) : undefined,
                status: selectedStatus.length > 0 ? selectedStatus.join(",") : undefined,
                dataInicial: formatDateParam(dateRange?.from),
                dataFinal: formatDateParam(dateRange?.to ?? dateRange?.from),
            })

            const mappedData = response.items.map((a: any) => {
                // Extrair lote e responsável das observações se houver tag [Lote: ... | Responsável: ...]
                let loteTag = ""
                let responsavelTag = ""
                if (a.observacoes) {
                    const matchLote = a.observacoes.match(/\[Lote:\s*([^|\]]+)/i)
                    if (matchLote) loteTag = `Lote - ${matchLote[1].trim()}`
                    const matchResp = a.observacoes.match(/Responsável:\s*([^\]]+)/i)
                    if (matchResp) responsavelTag = matchResp[1].trim()
                }

                return {
                    ...a,
                    loteTag,
                    responsavelTag: responsavelTag || "—",
                    numeroRegistro: a.numeroRegistro || "-",
                    animalNome: a.especieNome || `Animal ${a.animalId}`,
                    especieNome: a.especieNome || "-",
                    pesoAnimal: a.biometriaAnimal?.peso ?? a.pesoAnimal ?? "-",
                    faseDeVida: a.faseDeVida
                        ? (faseDeVidaMap[String(a.faseDeVida)] || a.faseDeVida)
                        : "-",
                    faseDeVidaId: a.faseDeVida ? (faseDeVidaIdMap[String(a.faseDeVida)] || String(a.faseDeVida)) : undefined,
                }
            })

            setData(mappedData)
            setTotalCount(response.totalCount)
        } catch (error) {
            console.error("Erro ao buscar alimentações", error)
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, search, selectedFaseDeVida, selectedEspecie, selectedStatus, dateRange])

    const filterSnapshot = JSON.stringify({
        search,
        pageSize,
        faseDeVida: selectedFaseDeVida,
        especieId: selectedEspecie,
        status: selectedStatus,
        dateRange,
    })

    const prevFilterRef = useRef(filterSnapshot)

    useEffect(() => {
        if (prevFilterRef.current !== filterSnapshot) {
            prevFilterRef.current = filterSnapshot
            if (page !== 1) {
                setPage(1)
                return
            }
        }
        fetchHistorico()
    }, [filterSnapshot, page, fetchHistorico])

    useEffect(() => {
        especieService.getLookup().then(setAllEspecies).catch(console.error)
    }, [])

    const filteredData = useMemo(() => {
        const filtered = [...data]

        return [...filtered].sort((a, b) => {
            let valA: any
            let valB: any
            if (sortField === "especieNome") {
                valA = normalizeStr(a.especieNome)
                valB = normalizeStr(b.especieNome)
            } else if (sortField === "numeroRegistro") {
                valA = normalizeStr(a.numeroRegistro)
                valB = normalizeStr(b.numeroRegistro)
            } else if (sortField === "dataAlimentacao") {
                valA = a.dataAlimentacao ? new Date(a.dataAlimentacao).getTime() : 0
                valB = b.dataAlimentacao ? new Date(b.dataAlimentacao).getTime() : 0
            } else if (sortField === "saldo") {
                valA = Number(a.saldo) || 0
                valB = Number(b.saldo) || 0
            } else {
                valA = normalizeStr(a.especieNome)
                valB = normalizeStr(b.especieNome)
            }
            if (valA < valB) return sortDirection === "asc" ? -1 : 1
            if (valA > valB) return sortDirection === "asc" ? 1 : -1
            return 0
        })
    }, [data, sortField, sortDirection])

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

    // Botão "Selecionar refeições pendentes"
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
            await fetchHistorico()
            await fetchStatusCounts()
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
            await fetchHistorico()
            await fetchStatusCounts()
        } catch (err: any) {
            console.error("Erro ao mudar situação:", err)
            toast.error(err.message || "Erro ao atualizar situação da refeição.")
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Alimentações"
                            breadcrumbUrl="/alimentacao"
                        />
                        <div className="flex items-center gap-3">
                            {hasPermission("Alimentação", "Editar") && (
                                <>
                                    <Button
                                        onClick={() => navigate("/alimentacao/lote")}
                                        className="bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30 flex items-center gap-2"
                                    >
                                        <Layers className="h-4 w-4" /> Alimentação por Lote
                                    </Button>
                                    <AddButton
                                        text="Registrar alimentação"
                                        route="/alimentacao/registrar-alimentacao"
                                    />
                                </>
                            )}
                        </div>
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">
                        {/* Barra de Ação em Lote (Passo 4) */}
                        {hasPermission("Alimentação", "Editar") && (
                            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card border rounded-xl shadow-2xs">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-foreground">
                                        {selectedRefeicaoIds.size} refeições selecionadas
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelecionarPendentes}
                                        className="text-xs h-8"
                                    >
                                        Selecionar refeições pendentes
                                    </Button>
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
                                        Atualizar status em lote
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 w-full flex justify-end">
                            <BarraDeBuscaEFiltro
                                search={searchInput}
                                onSearchChange={setSearchInput}
                                placeholder="Buscar por número de registro, espécie..."
                                filterSections={[
                                    {
                                        key: "sort",
                                        label: "Ordenar por",
                                        type: "radio",
                                        options: [
                                            { value: "especieNome:asc", label: "Espécie (A → Z)" },
                                            { value: "especieNome:desc", label: "Espécie (Z → A)" },
                                            { value: "numeroRegistro:asc", label: "Nº Registro (A → Z)" },
                                            { value: "numeroRegistro:desc", label: "Nº Registro (Z → A)" },
                                            { value: "dataAlimentacao:desc", label: "Data (mais recente)" },
                                            { value: "dataAlimentacao:asc", label: "Data (mais antiga)" },
                                        ],
                                        selectedValue: `${sortField}:${sortDirection}`,
                                        onValueChange: (val) => {
                                            const [field, dir] = val.split(":")
                                            setSortField(field)
                                            setSortDirection(dir as "asc" | "desc")
                                        },
                                    },
                                    {
                                        key: "status",
                                        label: "Situação",
                                        type: "checkbox",
                                        options: [
                                            { value: "1", label: "Alimentada", count: statusCounts.alimentada },
                                            { value: "0", label: "Pendente", count: statusCounts.pendente },
                                        ],
                                        selected: selectedStatus,
                                        onChange: setSelectedStatus,
                                    },
                                    {
                                        key: "faseDeVida",
                                        label: "Fase de Vida",
                                        type: "checkbox",
                                        options: [
                                            { value: "1", label: "Filhote" },
                                            { value: "2", label: "Jovem" },
                                            { value: "3", label: "Adulto" },
                                        ],
                                        selected: selectedFaseDeVida,
                                        onChange: setSelectedFaseDeVida,
                                    },
                                    {
                                        key: "dataAlimentacao",
                                        label: "Data de Alimentação",
                                        type: "dateRange",
                                        dateRange: dateRange,
                                        onDateRangeChange: setDateRange,
                                    },
                                    {
                                        key: "especie",
                                        label: "Espécie",
                                        type: "select",
                                        options: allEspecies.map((especie) => ({ 
                                            value: String(especie.id), 
                                            label: especie.nome 
                                        })),
                                        selectedValue: selectedEspecie,
                                        onValueChange: setSelectedEspecie,
                                    },
                                ]}
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border">
                                Nenhuma alimentação encontrada.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {/* Tabela Acordeão com Refeições (Passo 4) */}
                                <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-muted/60 text-muted-foreground font-semibold border-b text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-3 w-10 text-center"></th>
                                                <th className="p-3">Animal / espécie</th>
                                                <th className="p-3">Data / lote</th>
                                                <th className="p-3">Sala / responsável</th>
                                                <th className="p-3">Peso / sugerido (g)</th>
                                                <th className="p-3">Ofertado (g)</th>
                                                <th className="p-3">Resultado</th>
                                                <th className="p-3 w-12 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredData.map((item) => {
                                                const isExpanded = expandedIds.has(item.id)
                                                const refeicoes = item.refeicoes || []
                                                const refIds = refeicoes.map((r: any) => r.id).filter(Boolean)
                                                const allChecked = refIds.length > 0 && refIds.every((id: number) => selectedRefeicaoIds.has(id))
                                                const isAlimentada = item.status === "Alimentada" || item.status === 1

                                                // Não consumido
                                                const naoConsumido = (item.totalOfertado || 0) - (item.totalConsumido || 0)
                                                const percentualOfertado =
                                                    item.pesoAnimal && Number(item.pesoAnimal) > 0
                                                        ? (((item.totalOfertado || 0) / Number(item.pesoAnimal)) * 100).toFixed(1)
                                                        : "0.0"

                                                return (
                                                    <React.Fragment key={item.id}>
                                                        <tr
                                                            className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                                                                isExpanded ? "bg-muted/15" : ""
                                                            }`}
                                                            onClick={() => toggleExpand(item.id)}
                                                        >
                                                            {/* Checkbox da linha (seleciona todas as refeições do animal) */}
                                                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <Checkbox
                                                                    checked={allChecked}
                                                                    onCheckedChange={() => toggleSelectAnimalRefeicoes(item)}
                                                                />
                                                            </td>

                                                            {/* Animal / Espécie */}
                                                            <td className="p-3">
                                                                <div className="font-bold text-foreground text-sm">
                                                                    #{item.numeroRegistro}
                                                                </div>
                                                                <div className="text-xs italic text-muted-foreground">
                                                                    {item.especieNome}
                                                                </div>
                                                            </td>

                                                            {/* Data / Lote */}
                                                            <td className="p-3 text-xs">
                                                                <div className="font-medium text-foreground">
                                                                    {item.dataAlimentacao ? new Date(item.dataAlimentacao).toLocaleDateString() : "—"}
                                                                </div>
                                                                <div className="text-muted-foreground text-[11px]">
                                                                    {item.loteTag || "Individual"}
                                                                </div>
                                                            </td>

                                                            {/* Sala / Responsável */}
                                                            <td className="p-3 text-xs">
                                                                <div className="font-medium text-foreground">
                                                                    {item.animalLocalizacaoNome || "—"}
                                                                </div>
                                                                <div className="text-muted-foreground text-[11px]">
                                                                    {item.responsavelTag}
                                                                </div>
                                                            </td>

                                                            {/* Peso / Sugerido */}
                                                            <td className="p-3 text-xs">
                                                                <div className="font-medium">{item.pesoAnimal ?? "—"} g</div>
                                                                <div className="text-muted-foreground text-[11px]">
                                                                    {item.pesoRecomendado} g · {item.porcentagemPesoRecomendado ?? 20}%
                                                                </div>
                                                            </td>

                                                            {/* Ofertado */}
                                                            <td className="p-3 text-xs">
                                                                <div className="font-bold text-foreground">
                                                                    {(item.totalOfertado || 0).toFixed(1)} g
                                                                </div>
                                                                <div className="text-muted-foreground text-[11px]">
                                                                    {refeicoes.length} refeição{refeicoes.length > 1 ? "ões" : ""} · {percentualOfertado}%
                                                                </div>
                                                            </td>

                                                            {/* Resultado e Status */}
                                                            <td className="p-3">
                                                                <div className="flex flex-col gap-1 items-start">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                            isAlimentada
                                                                                ? "bg-green-100 text-green-700"
                                                                                : "bg-red-100 text-red-700"
                                                                        }`}
                                                                    >
                                                                        {isAlimentada ? "Aceitou" : "Pendente"}
                                                                    </span>
                                                                    <span className="text-[11px] text-muted-foreground">
                                                                        Consumido: {(item.totalConsumido || 0).toFixed(1)} g
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Expandir / Chevron */}
                                                            <td className="p-3 text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </td>
                                                        </tr>

                                                        {/* Linhas Filhas: Refeições expandidas */}
                                                        {isExpanded && (
                                                            <tr className="bg-muted/10 border-b">
                                                                <td colSpan={8} className="p-4 pl-12">
                                                                    <div className="space-y-3">
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
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

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
                            </div>
                        )}
                    </div>
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}
