import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { HeaderContainer } from "@/components/header-container"
import { PageContainer } from "@/components/page-container"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { especieService, type Especie } from "@/services/EspecieService"
import rotinaAnimalService from "@/services/RotinaAnimalService"
import { usePermissions } from "@/contexts/PermissionsContext"

interface EspecieRow extends Especie {
    rotinaTipos?: string[]
}

export default function EspeciesList() {
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()
    const [rows, setRows] = useState<EspecieRow[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const [search, setSearch] = useState("")

    const fetchData = async () => {
        try {
            setLoading(true)
            const [especiesData, rotinasData] = await Promise.all([
                especieService.getAll({ page, pageSize, search }),
                rotinaAnimalService.getAll({ page: 1, pageSize: 9999 }),
            ])

            const rotinaMap = new Map<number, string[]>()
            const rotinasItems = rotinasData.items || (Array.isArray(rotinasData) ? rotinasData : [])
            for (const r of rotinasItems) {
                const existing = rotinaMap.get(r.especieId) || []
                if (!existing.includes(r.tipoRotina)) {
                    existing.push(r.tipoRotina)
                }
                rotinaMap.set(r.especieId, existing)
            }

            setRows(
                especiesData.items.map((e) => ({
                    ...e,
                    rotinaTipos: rotinaMap.get(e.id) || [],
                }))
            )
            setTotalCount(especiesData.totalCount)
        } catch (error) {
            toast.error("Erro ao carregar dados.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setPage(1)
    }, [search, pageSize])

    useEffect(() => {
        fetchData()
    }, [page, pageSize, search])

    const confirmDelete = async () => {
        if (deleteId === null) return
        try {
            setDeleting(true)
            await especieService.delete(deleteId)
            toast.success("Espécie excluída com sucesso!")
            setRows(rows.filter((e) => e.id !== deleteId))
            setDeleteId(null)
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                "Esta espécie possui animais vinculados e não pode ser excluída."
            toast.error(msg, { duration: 5000 })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral />
                        <div className="flex items-center gap-4">
                            {hasPermission("Espécies cadastradas", "Gerenciar") && <AddButton text="Nova Espécie" route="/plantel/especies/cadastro" />}
                        </div>
                    </HeaderContainer>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-end">
                            <BarraDeBuscaEFiltro
                                search={search}
                                onSearchChange={setSearch}
                                placeholder="Buscar espécie..."
                                filterSections={[]}
                            />
                        </div>

                        <DataTable
                            columns={[
                                {
                                    header: "Espécie",
                                    accessorKey: "nome",
                                    sortable: true,
                                    cell: (item) => (
                                        <span className="font-medium text-gray-900">{item.nome}</span>
                                    ),
                                },
                                {
                                    header: "Nome Popular",
                                    accessorKey: "nomePopular",
                                    sortable: true,
                                    cell: (item) => (
                                        <span className="text-gray-600">{item.nomePopular || "-"}</span>
                                    ),
                                },
                                {
                                    header: "Grupo",
                                    accessorKey: "grupoNome",
                                    cell: (item) => (
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                            {item.grupoNome || "-"}
                                        </span>
                                    ),
                                },
                                {
                                    header: "Rotinas",
                                    cell: (item) => (
                                        <div className="flex flex-wrap gap-1">
                                            {item.rotinaTipos?.length ? (
                                                item.rotinaTipos.map((t) => (
                                                    <span
                                                        key={t}
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t === "Alimentacao"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-green-100 text-green-700"
                                                            }`}
                                                    >
                                                        {t === "Alimentacao" ? "Alimentação" : "Biometria"}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">Nenhuma</span>
                                            )}
                                        </div>
                                    ),
                                },
                            ]}
                            data={rows}
                            loading={loading}
                            emptyMessage={search ? "Nenhuma espécie encontrada para a busca." : "Nenhuma espécie cadastrada."}
                            onRowClick={hasPermission("Espécies cadastradas", "Editar") ? (item) => navigate(`/plantel/especies/${item.id}`) : undefined}
                            serverPagination={{
                                page,
                                pageSize,
                                totalCount,
                                onPageChange: setPage,
                                onPageSizeChange: (size) => {
                                    setPageSize(size)
                                    setPage(1)
                                },
                            }}
                        />
                    </div>
                </PageContainer>
            </SidebarInset>

            <DeleteConfirmModal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Espécie"
                description="Deseja realmente excluir esta espécie? Esta ação não poderá ser desfeita e removerá permanentemente o registro."
                loading={deleting}
            />
        </SidebarProvider>
    )
}
