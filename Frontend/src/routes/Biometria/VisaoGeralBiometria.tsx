import { useState, useEffect, useMemo, useCallback } from "react"
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
import { type DateRange } from "react-day-picker"
import { getBiometriaAnimais } from "@/services/BiometriaAnimalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { usePermissions } from "@/contexts/PermissionsContext"

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

export default function VisaoGeralBiometria() {
    const navigate = useNavigate()

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

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const { hasPermission } = usePermissions()


    useEffect(() => {
        especieService.getLookup().then(setAllEspecies).catch(console.error)
    }, [])

    const fetchHistorico = useCallback(async () => {
        try {
            setLoading(true)
            const response = await getBiometriaAnimais({
                page,
                pageSize,
                search,
                faseDeVida: selectedFaseDeVida.length > 0 ? selectedFaseDeVida.join(",") : undefined,
                especieId: selectedEspecie && selectedEspecie !== "all" ? Number(selectedEspecie) : undefined,
            })

            const mappedData = response.items.map((b: any) => ({
                ...b,
                numeroRegistro: b.numeroRegistro || "-",
                animalNome: b.especieNome || `Animal ${b.animalId}`,
                especieNome: b.especieNome || "-",
                pesoAnimal: b.peso ?? "-",
                faseDeVida: b.faseDeVida
                    ? (faseDeVidaMap[String(b.faseDeVida)] || b.faseDeVida)
                    : "-",
                faseDeVidaId: b.faseDeVida ? (faseDeVidaIdMap[String(b.faseDeVida)] || String(b.faseDeVida)) : undefined,
            }))

            setData(mappedData)
            setTotalCount(response.totalCount)
        } catch (error) {
            console.error("Erro ao buscar as biometrias", error)
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, search, selectedFaseDeVida, selectedEspecie])

    useEffect(() => {
        setPage(1)
    }, [search, pageSize, selectedFaseDeVida, selectedEspecie])

    useEffect(() => {
        fetchHistorico()
    }, [fetchHistorico])

    const filteredData = useMemo(() => {
        const filtered = data.filter((item) => {
            if (selectedStatus.length > 0) {
                const statusStr = item.status === 1 ? "1" : "0"
                if (!selectedStatus.includes(statusStr)) return false
            }
            if (selectedFaseDeVida.length > 0) {
                const itemFaseId = item.faseDeVidaId || (item.faseDeVida ? faseDeVidaIdMap[item.faseDeVida] : undefined)
                if (!itemFaseId || !selectedFaseDeVida.includes(itemFaseId)) return false
            }
            if (dateRange?.from) {
                if (!item.dataBiometria) return false
                const biometriaDate = new Date(item.dataBiometria)
                biometriaDate.setHours(0, 0, 0, 0)
                const from = new Date(dateRange.from)
                from.setHours(0, 0, 0, 0)
                if (dateRange.to) {
                    const to = new Date(dateRange.to)
                    to.setHours(23, 59, 59, 999)
                    if (biometriaDate < from || biometriaDate > to) return false
                } else {
                    if (biometriaDate.getTime() !== from.getTime()) return false
                }
            }
            const normalizedSearch = normalizeStr(search)
            if (!normalizedSearch) return true
            return (
                normalizeStr(item.numeroRegistro).includes(normalizedSearch) ||
                normalizeStr(item.especieNome).includes(normalizedSearch) ||
                normalizeStr(item.animalNome).includes(normalizedSearch) ||
                normalizeStr(item.faseDeVida).includes(normalizedSearch) ||
                normalizeStr(item.peso?.toString()).includes(normalizedSearch) ||
                normalizeStr(item.pesoAnimal?.toString()).includes(normalizedSearch) ||
                normalizeStr(item.comprimento?.toString()).includes(normalizedSearch) ||
                normalizeStr(item.comprimentoCauda?.toString()).includes(normalizedSearch)
            )
        })

        return [...filtered].sort((a, b) => {
            let valA: any
            let valB: any
            if (sortField === "especieNome") {
                valA = normalizeStr(a.especieNome)
                valB = normalizeStr(b.especieNome)
            } else if (sortField === "numeroRegistro") {
                valA = normalizeStr(a.numeroRegistro)
                valB = normalizeStr(b.numeroRegistro)
            } else if (sortField === "dataBiometria") {
                valA = a.dataBiometria ? new Date(a.dataBiometria).getTime() : 0
                valB = b.dataBiometria ? new Date(b.dataBiometria).getTime() : 0
            } else if (sortField === "peso") {
                valA = Number(a.peso) || 0
                valB = Number(b.peso) || 0
            } else {
                valA = normalizeStr(a.especieNome)
                valB = normalizeStr(b.especieNome)
            }
            if (valA < valB) return sortDirection === "asc" ? -1 : 1
            if (valA > valB) return sortDirection === "asc" ? 1 : -1
            return 0
        })
    }, [data, selectedStatus, dateRange, sortField, sortDirection])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Biometrias"
                            breadcrumbUrl="/biometria"
                            title="Registros de biometria"
                        />
                        <div className="flex items-center gap-4">
                            {hasPermission("Biometria", "Gerenciar") && (
                                <AddButton
                                    text="Registrar biometria"
                                    route="/biometria/cadastro"
                                />
                            )}
                        </div>
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">
                        <div className="flex-1 w-full flex justify-end">
                            <BarraDeBuscaEFiltro
                                search={search}
                                onSearchChange={setSearch}
                                placeholder="Buscar por animal, data..."
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
                                            { value: "dataBiometria:desc", label: "Data (mais recente)" },
                                            { value: "dataBiometria:asc", label: "Data (mais antiga)" },
                                        ],
                                        selectedValue: `${sortField}:${sortDirection}`,
                                        onValueChange: (val) => {
                                            const [field, dir] = val.split(":")
                                            setSortField(field)
                                            setSortDirection(dir as "asc" | "desc")
                                        },
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
                                        key: "dataBiometria",
                                        label: "Data de Biometria",
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
                                            label: especie.nome,
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
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredData.map((item) => {
                                    const dataOk = item.dataBiometria && !item.dataBiometria.startsWith("0001")
                                    return (
                                        <HorizontalCard
                                            key={item.id}
                                            title={`${item.especieNome} `}
                                            subtitle={`#${item.numeroRegistro} · ${item.faseDeVida}`}
                                            infoBlocks={[
                                                {
                                                    label: "Data",
                                                    value: dataOk
                                                        ? new Date(item.dataBiometria).toLocaleDateString()
                                                        : "-",
                                                },
                                                {
                                                    label: "Peso (g)",
                                                    value: item.peso ? Number(item.peso).toLocaleString("pt-BR", { minimumFractionDigits: 1 }) : "-",
                                                },
                                                {
                                                    label: "Compr. (cm)",
                                                    value: item.comprimento ? Number(item.comprimento).toLocaleString("pt-BR", { minimumFractionDigits: 1 }) : "-",
                                                },
                                                {
                                                    label: "Cauda (cm)",
                                                    value: item.comprimentoCauda ? Number(item.comprimentoCauda).toLocaleString("pt-BR", { minimumFractionDigits: 1 }) : "-",
                                                },
                                            ]}

                                            onClick={() => {
                                                if (hasPermission("Biometria", "Editar")) {
                                                    navigate(`/biometria/cadastro/${item.id}`);
                                                }
                                            }}
                                        />
                                    )
                                })}

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
