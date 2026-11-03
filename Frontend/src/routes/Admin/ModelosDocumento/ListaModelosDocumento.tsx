import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, FileText, PanelTop, PanelBottom, ChevronDown } from "lucide-react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePermissions } from "@/contexts/PermissionsContext"

import { modeloDocumentoService, type ModeloDocumentoVm, TipoSecaoTemplate, TipoDocumento } from "@/services/ModeloDocumentoService"

const tipoDocumentoLabels: Record<number, string> = {
    [TipoDocumento.Geral]: "Geral",
    [TipoDocumento.LiberacaoQuarentena]: "Liberação de Quarentena",
    [TipoDocumento.AltaAmbulatorial]: "Alta Ambulatorial",
    [TipoDocumento.SolicitacaoExame]: "Solicitação de Exame"
}

export default function ListaModelosDocumento() {
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Modelo de documento", "Editar")
    const canDelete = hasPermission("Modelo de documento", "Gerenciar")
    const [modelos, setModelos] = useState<ModeloDocumentoVm[]>([])
    const [activeTab, setActiveTab] = useState<string>("body")
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; nome: string }>({
        isOpen: false,
        id: null,
        nome: ""
    })
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        carregarModelos()
    }, [])

    const carregarModelos = async () => {
        try {
            setLoading(true)
            const data = await modeloDocumentoService.getAll()
            setModelos(data)
        } catch (error) {
            toast.error("Erro ao carregar modelos de documentos")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return
        if (!canDelete) {
            toast.error("Você não tem permissão para excluir modelos.")
            return
        }
        try {
            setDeleting(true)
            await modeloDocumentoService.delete(deleteModal.id)
            toast.success("Modelo excluído com sucesso!")
            setDeleteModal({ isOpen: false, id: null, nome: "" })
            carregarModelos()
        } catch (error: any) {
            toast.error("Erro ao excluir modelo. Verifique se ele está vinculado a outros documentos.")
        } finally {
            setDeleting(false)
        }
    }

    const filteredData = useMemo(() => {
        return modelos.filter(m => {
            const secao = m.tipoSecao || TipoSecaoTemplate.Body
            let matchesTab = true
            if (activeTab === "body") matchesTab = secao === TipoSecaoTemplate.Body
            if (activeTab === "header") matchesTab = secao === TipoSecaoTemplate.Header
            if (activeTab === "footer") matchesTab = secao === TipoSecaoTemplate.Footer

            const matchesSearch = !search.trim() || 
                m.nome.toLowerCase().includes(search.toLowerCase()) ||
                (m.conteudo && m.conteudo.toLowerCase().includes(search.toLowerCase()))

            return matchesTab && matchesSearch
        })
    }, [modelos, activeTab, search])

    const bodyColumns: ColumnDef<ModeloDocumentoVm>[] = [
        {
            header: "Nome do Template",
            accessorKey: "nome",
            sortable: true,
            cell: (m) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{m.nome}</span>
                </div>
            )
        },
        {
            header: "Tipo de Documento",
            accessorKey: "tipoDocumento",
            sortable: true,
            cell: (m) => (
                <span className="text-sm text-gray-700 font-medium">
                    {tipoDocumentoLabels[m.tipoDocumento] || "Geral"}
                </span>
            )
        },
        {
            header: "Cabeçalho / Rodapé Vinculados",
            cell: (m) => (
                <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-500">Header:</span>
                        <span className={m.headerTemplate ? "text-gray-800 font-medium" : "text-gray-400"}>
                            {m.headerTemplate?.nome || "Nenhum"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-500">Footer:</span>
                        <span className={m.footerTemplate ? "text-gray-800 font-medium" : "text-gray-400"}>
                            {m.footerTemplate?.nome || "Nenhum"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "ativo",
            sortable: true,
            cell: (m) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.ativo ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                    {m.ativo ? "Ativo" : "Inativo"}
                </span>
            )
        }
    ]

    const headerFooterColumns: ColumnDef<ModeloDocumentoVm>[] = [
        {
            header: "Nome do Layout",
            accessorKey: "nome",
            sortable: true,
            cell: (m) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{m.nome}</span>
                </div>
            )
        },
        {
            header: "Configuração das 3 Colunas",
            cell: (m) => {
                if (!m.configuracaoLayoutJson) return <span className="text-xs text-gray-400">Padrão em branco</span>
                try {
                    const cfg = JSON.parse(m.configuracaoLayoutJson)
                    const parts = []
                    if (cfg.esquerda?.conteudo) parts.push(`Esq: [${cfg.esquerda.tipo}]`)
                    if (cfg.meio?.conteudo) parts.push(`Meio: [${cfg.meio.tipo}]`)
                    if (cfg.direita?.conteudo) parts.push(`Dir: [${cfg.direita.tipo}]`)
                    return <span className="text-xs text-gray-600 font-mono">{parts.join(" | ") || "Sem conteúdo"}</span>
                } catch {
                    return <span className="text-xs text-gray-400">Layout customizado</span>
                }
            }
        },
        {
            header: "Status",
            accessorKey: "ativo",
            sortable: true,
            cell: (m) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.ativo ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                    {m.ativo ? "Ativo" : "Inativo"}
                </span>
            )
        }
    ]

    const columns = activeTab === "body" ? bodyColumns : headerFooterColumns

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-white">
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Administração"
                            title="Templates de Documentos"
                        >
                            {canEdit && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button className="bg-brand text-primary-foreground shadow-md hover:brightness-95 hover:shadow-lg transition-all duration-200">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Novo Template <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/admin/modelos/novo?tipoSecao=${TipoSecaoTemplate.Body}`)}>
                                        <FileText className="mr-2 h-4 w-4 text-emerald-600" />
                                        Template de Documento (Corpo)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/admin/modelos/novo?tipoSecao=${TipoSecaoTemplate.Header}`)}>
                                        <PanelTop className="mr-2 h-4 w-4 text-blue-600" />
                                        Template de Cabeçalho (Header)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/admin/modelos/novo?tipoSecao=${TipoSecaoTemplate.Footer}`)}>
                                        <PanelBottom className="mr-2 h-4 w-4 text-amber-600" />
                                        Template de Rodapé (Footer)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                        </HeaderGeral>
                    </HeaderContainer>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                <TabsList className="grid grid-cols-3 max-w-md bg-gray-100 p-1">
                                    <TabsTrigger value="body" className="flex items-center gap-2 text-xs">
                                        <FileText className="h-4 w-4" />
                                        Documentos (Corpo)
                                    </TabsTrigger>
                                    <TabsTrigger value="header" className="flex items-center gap-2 text-xs">
                                        <PanelTop className="h-4 w-4" />
                                        Cabeçalhos
                                    </TabsTrigger>
                                    <TabsTrigger value="footer" className="flex items-center gap-2 text-xs">
                                        <PanelBottom className="h-4 w-4" />
                                        Rodapés
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="w-full md:w-72">
                                <BarraDeBuscaEFiltro
                                    search={search}
                                    onSearchChange={setSearch}
                                    placeholder="Buscar template..."
                                />
                            </div>
                        </div>

                        <DataTable
                            data={filteredData}
                            columns={columns}
                            loading={loading}
                            emptyMessage={`Nenhum template de ${activeTab === "body" ? "documento" : activeTab === "header" ? "cabeçalho" : "rodapé"} encontrado.`}
                            onRowClick={(m) => navigate(`/admin/modelos/${m.id}`)}
                            defaultSortKey="nome"
                            defaultSortDirection="asc"
                        />
                    </div>

                    <DeleteConfirmModal
                        isOpen={deleteModal.isOpen}
                        onClose={() => setDeleteModal({ isOpen: false, id: null, nome: "" })}
                        onConfirm={handleDelete}
                        loading={deleting}
                        title="Excluir Template"
                        description={`Tem certeza de que deseja excluir o modelo "${deleteModal.nome}"? Esta ação não poderá ser desfeita.`}
                    />
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}
