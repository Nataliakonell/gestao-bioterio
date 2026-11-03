import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { HorizontalCard } from "@/components/horizontal-card"
import { PaginationBar } from "@/components/pagination-bar"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import rotinaAnimalService, { type RotinaAnimalListVm } from "@/services/RotinaAnimalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { usePermissions } from "@/contexts/PermissionsContext"

const normalizeStr = (str: string | null | undefined) => {
    if (!str) return ""
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

const dayShortName: Record<string, string> = {
    Domingo: "Dom",
    Segunda: "Seg",
    Terça: "Ter",
    Quarta: "Qua",
    Quinta: "Qui",
    Sexta: "Sex",
    Sábado: "Sáb",
}

function formatFrequencia(item: RotinaAnimalListVm): string {
    if (item.tipoFrequencia === "Diaria") return "Diário"
    if (item.tipoFrequencia === "IntervaloEmDias") return `A cada ${item.frequencia} dia(s)`
    if (item.tipoFrequencia === "DiasDaSemana") {
        const dias = item.diaSemanaProgramado
            ?.map((d) => dayShortName[d] ?? d.slice(0, 3))

        if (!dias || dias.length === 0) return "-"

        let diasStr = dias.join(", ")
        if (dias.length > 1) {
            const lastCommaIndex = diasStr.lastIndexOf(", ")
            diasStr = diasStr.substring(0, lastCommaIndex) + " e " + diasStr.substring(lastCommaIndex + 2)
        }

        return `A cada ${item.frequencia || 1} semana(s): ${diasStr}`
    }
    return "-"
}

export default function VisaoGeralRotina() {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const [data, setData] = useState<RotinaAnimalListVm[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    const [selectedEspecie, setSelectedEspecie] = useState<string>("")
    const [allEspecies, setAllEspecies] = useState<{ id: number; nome: string }[]>([])
    const [selectedFase, setSelectedFase] = useState<string[]>([])
    const [selectedTipo, setSelectedTipo] = useState<string[]>([])

    const [sortField, setSortField] = useState<string>("especieNome")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const { hasPermission } = usePermissions()


    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const especieIdParam = selectedEspecie && selectedEspecie !== "all" ? Number(selectedEspecie) : undefined
            const response = await rotinaAnimalService.getAll({
                page,
                pageSize,
                search,
                especieId: especieIdParam,
                faseDeVida: selectedFase.length > 0 ? selectedFase.join(",") : undefined,
            })
            setData(response.items || [])
            setTotalCount(response.totalCount || 0)
        } catch {
            toast.error("Erro ao carregar rotinas")
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, search, selectedEspecie, selectedFase])

    useEffect(() => {
        setPage(1)
    }, [search, pageSize, selectedFase, selectedEspecie])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        especieService.getLookup().then(setAllEspecies).catch(console.error)
    }, [])

    const fasesUnicas = Array.from(new Set((data || []).map((r) => r.faseDeVida).filter((f) => f !== "0")))

    const filteredData = useMemo(() => {
        const filtered = (data || []).filter((item) => {
            if (selectedTipo && selectedTipo.length > 0) {
                if (!selectedTipo.includes(item.tipoRotina)) return false
            }
            if (selectedEspecie && selectedEspecie !== "all") {
                if (String(item.especieId) !== selectedEspecie) return false
            }
            const normalizedSearch = normalizeStr(search)
            if (!normalizedSearch) return true
            const frequenciaStr = formatFrequencia(item)
            return (
                normalizeStr(item.especieNome).includes(normalizedSearch) ||
                normalizeStr(item.tipoRotina).includes(normalizedSearch) ||
                normalizeStr(item.faseDeVida).includes(normalizedSearch) ||
                normalizeStr(frequenciaStr).includes(normalizedSearch)
            )
        })

        return [...filtered].sort((a, b) => {
            let valA: any
            let valB: any
            if (sortField === "especieNome") {
                valA = normalizeStr(a.especieNome)
                valB = normalizeStr(b.especieNome)
            } else if (sortField === "faseDeVida") {
                const faseOrder: Record<string, number> = { Filhote: 1, Jovem: 2, Adulto: 3, Todos: 4 }
                valA = faseOrder[a.faseDeVida] ?? 99
                valB = faseOrder[b.faseDeVida] ?? 99
            } else if (sortField === "tipoRotina") {
                valA = normalizeStr(a.tipoRotina)
                valB = normalizeStr(b.tipoRotina)
            } else {
                valA = normalizeStr(a.especieNome)
                valB = normalizeStr(b.especieNome)
            }
            if (valA < valB) return sortDirection === "asc" ? -1 : 1
            if (valA > valB) return sortDirection === "asc" ? 1 : -1
            return 0
        })
    }, [data, selectedTipo, search, sortField, sortDirection])

    const alimentadaCount = data.filter((d) => d.tipoRotina === "Alimentacao").length
    const pendenteCount = data.filter((d) => d.tipoRotina === "Biometria").length

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Rotinas"
                            breadcrumbUrl="/rotina/visao-geral"
                        />
                        <div className="flex items-center gap-4">
                            {hasPermission("Rotinas", "Gerenciar") && (
                                <AddButton text="Criar Rotina" route="/rotina/cadastro" />
                            )}
                        </div>
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">
                        <div className="flex justify-end">
                            <BarraDeBuscaEFiltro
                                search={search}
                                onSearchChange={setSearch}
                                placeholder="Buscar por espécie, fase, frequência..."
                                filterSections={[
                                    {
                                        key: "sort",
                                        label: "Ordenar por",
                                        type: "radio",
                                        options: [
                                            { value: "especieNome:asc", label: "Espécie (A → Z)" },
                                            { value: "especieNome:desc", label: "Espécie (Z → A)" }
                                        ],
                                        selectedValue: `${sortField}:${sortDirection}`,
                                        onValueChange: (val) => {
                                            const [field, dir] = val.split(":")
                                            setSortField(field)
                                            setSortDirection(dir as "asc" | "desc")
                                        },
                                    },
                                    {
                                        key: "tipo",
                                        label: "Tipo",
                                        type: "checkbox",
                                        options: [
                                            { value: "Alimentacao", label: "Alimentação", count: alimentadaCount },
                                            { value: "Biometria", label: "Biometria", count: pendenteCount },
                                        ],
                                        selected: selectedTipo,
                                        onChange: setSelectedTipo,
                                    },
                                    {
                                        key: "especie",
                                        label: "Espécie",
                                        type: "select",
                                        options: allEspecies.map((especie) => ({
                                            value: String(especie.id),
                                            label: especie.nome,
                                        })),
                                        selectedValue: selectedEspecie,
                                        onValueChange: setSelectedEspecie,
                                    },
                                    {
                                        key: "fase",
                                        label: "Fase de Vida",
                                        type: "checkbox",
                                        options: fasesUnicas.map((fase) => ({
                                            value: fase,
                                            label: fase,
                                        })),
                                        selected: selectedFase,
                                        onChange: setSelectedFase,
                                    },
                                ]}
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                {search
                                    ? "Nenhuma rotina encontrada para a busca."
                                    : "Nenhuma rotina cadastrada."}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredData.map((item) => (
                                    <HorizontalCard
                                        key={item.id}
                                        title={`${item.especieNome} `}
                                        subtitle={`Fase: ${item.faseDeVida}`}
                                        badge={
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.tipoRotina === "Alimentacao"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {item.tipoRotina === "Alimentacao" ? "Alimentação" : "Biometria"}
                                            </span>
                                        }
                                        infoBlocks={[
                                            {
                                                label: "Frequência",
                                                value: formatFrequencia(item),
                                            },
                                        ]}
                                        onClick={() => {
                                            if (hasPermission("Rotinas", "Editar")) {
                                                navigate(`/rotina/editar/${item.id}`)
                                            }
                                        }}
                                    />
                                ))}

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
