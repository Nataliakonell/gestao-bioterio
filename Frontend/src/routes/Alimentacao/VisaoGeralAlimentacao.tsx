import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { getAlimentacoes } from "@/services/AlimentacaoService"
import { Layers } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { usePermissions } from "@/contexts/PermissionsContext"
import { Button } from "@/components/ui/button"
import { TabelaGeralAlimentacao } from "./TabelaGeralAlimentacao"

const normalizeStr = (str: string | null | undefined) => {
    if (!str) return ""
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
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

    const handleDataUpdated = async () => {
        await fetchHistorico()
        await fetchStatusCounts()
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
                                <AddButton
                                    text="Alimentação por Lote"
                                    route="/alimentacao/lote"
                                />
                            )}
                        </div>
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">
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

                        <TabelaGeralAlimentacao
                            data={filteredData}
                            loading={loading}
                            page={page}
                            pageSize={pageSize}
                            totalCount={totalCount}
                            onPageChange={setPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size)
                                setPage(1)
                            }}
                            onDataUpdated={handleDataUpdated}
                        />
                    </div>
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}
