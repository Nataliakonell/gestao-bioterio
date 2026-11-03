import React, { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { PaginationBar } from "@/components/pagination-bar"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getProtocolosDesverminacao, type ProtocoloDesverminacaoListVm } from "@/services/ProtocoloDesverminacaoService"
import { CardProtocoloDesverminacao } from "../../components/desverminacao/CardProtocoloDesverminacao"
import { usePermissions } from "@/contexts/PermissionsContext"

const normalizeStr = (str: string | null | undefined) => {
    if (!str) return ""
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

const statusLabelMap: Record<string, string> = {
    "AguardandoPrimeiraDose": "Aguardando 1ª dose",
    "Aguardando 1ª dose": "Aguardando 1ª dose",
    "AguardandoSegundaDose": "Aguardando 2ª dose",
    "Aguardando 2ª dose": "Aguardando 2ª dose",
    "ManutencaoAnual": "Manutenção Anual",
    "Manutenção Anual": "Manutenção Anual",
    "Atrasado": "Atrasado",
    "Atrasada": "Atrasado",
    "Concluido": "Concluído",
    "Concluído": "Concluído",
    "Suspenso": "Suspenso",
    "Hoje": "Iniciar hoje",
}

const getStatusLabel = (status: string) => statusLabelMap[status] || status

export default function VisaoGeralDesverminacao() {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const [data, setData] = useState<ProtocoloDesverminacaoListVm[]>([])
    const [loading, setLoading] = useState(true)

    const [selectedStatus, setSelectedStatus] = useState<string[]>([])
    
    const [sortField, setSortField] = useState<string>("dataEntrada")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { hasPermission } = usePermissions()

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await getProtocolosDesverminacao()
            setData(response || [])
        } catch {
            toast.error("Erro ao carregar protocolos de desverminação")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const statusUnicos = useMemo(() => {
        const statuses = new Set<string>()
        data.forEach((p) => {
            if (p.statusProtocolo) statuses.add(p.statusProtocolo)
        })
        return Array.from(statuses)
    }, [data])

    const filteredData = useMemo(() => {
        const filtered = (data || []).filter((item) => {
            if (selectedStatus && selectedStatus.length > 0) {
                if (!selectedStatus.includes(item.statusProtocolo)) return false
            }
            const normalizedSearch = normalizeStr(search)
            if (!normalizedSearch) return true
            const statusLabel = getStatusLabel(item.statusProtocolo)
            return (
                normalizeStr(item.numeroRegistro).includes(normalizedSearch) ||
                normalizeStr(item.especieNome).includes(normalizedSearch) ||
                normalizeStr(item.statusProtocolo).includes(normalizedSearch) ||
                normalizeStr(statusLabel).includes(normalizedSearch)
            )
        })

        return [...filtered].sort((a, b) => {
            let valA: any
            let valB: any
            if (sortField === "dataEntrada") {
                valA = a.dataEntrada ? new Date(a.dataEntrada).getTime() : 0
                valB = b.dataEntrada ? new Date(b.dataEntrada).getTime() : 0
            } else if (sortField === "dataProximaDose") {
                valA = a.dataProximaDose ? new Date(a.dataProximaDose).getTime() : 0
                valB = b.dataProximaDose ? new Date(b.dataProximaDose).getTime() : 0
            } else if (sortField === "numeroRegistro") {
                valA = normalizeStr(a.numeroRegistro)
                valB = normalizeStr(b.numeroRegistro)
            } else {
                valA = normalizeStr(a.especieNome)
                valB = normalizeStr(b.especieNome)
            }
            if (valA < valB) return sortDirection === "asc" ? -1 : 1
            if (valA > valB) return sortDirection === "asc" ? 1 : -1
            return 0
        })
    }, [data, selectedStatus, search, sortField, sortDirection])

    useEffect(() => {
        setPage(1)
    }, [search, selectedStatus, sortField, sortDirection])

    const paginatedData = useMemo(() => {
        const startIndex = (page - 1) * pageSize
        return filteredData.slice(startIndex, startIndex + pageSize)
    }, [filteredData, page, pageSize])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Clínico"
                            breadcrumbUrl="/desverminacao/visao-geral"
                            title="Visão Geral da Desverminação"
                        />
                        <div className="flex items-center gap-4">
                            {hasPermission("Desverminação", "Criar") && (
                                <AddButton text="Registrar protocolo" route="/desverminacao/registrar-dose" />
                            )}
                        </div>
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">
                        <div className="flex justify-end">
                            <BarraDeBuscaEFiltro
                                search={search}
                                onSearchChange={setSearch}
                                placeholder="Buscar por registro, espécie..."
                                filterSections={[
                                    {
                                        key: "sort",
                                        label: "Ordenar por",
                                        type: "radio",
                                        options: [
                                            { value: "dataEntrada:desc", label: "Data de Entrada (mais recente)" },
                                            { value: "dataEntrada:asc", label: "Data de Entrada (mais antiga)" },
                                            { value: "dataProximaDose:desc", label: "Próx. Dose (mais distante)" },
                                            { value: "dataProximaDose:asc", label: "Próx. Dose (mais próxima)" },
                                            { value: "numeroRegistro:asc", label: "Nº Registro (A → Z)" },
                                            { value: "numeroRegistro:desc", label: "Nº Registro (Z → A)" },
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
                                        label: "Status do Protocolo",
                                        type: "checkbox",
                                        options: statusUnicos.map((s) => ({
                                            value: s,
                                            label: getStatusLabel(s),
                                        })),
                                        selected: selectedStatus,
                                        onChange: setSelectedStatus,
                                    }
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
                                    ? "Nenhum protocolo encontrado para a busca."
                                    : "Nenhum protocolo registrado."}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {paginatedData.map((item) => (
                                    <CardProtocoloDesverminacao
                                        key={item.id}
                                        item={item}
                                        onClick={() => {
                                                if (hasPermission("Desverminação", "Editar")) {
                                                navigate(`/desverminacao/editar/${item.id}`)
                                            }
                                        }}
                                    />
                                ))}

                                <PaginationBar
                                    currentPage={page}
                                    pageSize={pageSize}
                                    totalCount={filteredData.length}
                                    onPageChange={setPage}
                                    onPageSizeChange={(newSize) => {
                                        setPageSize(newSize)
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
