import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { HorizontalCard } from "@/components/horizontal-card"
import { PaginationBar } from "@/components/pagination-bar"
import { getBiometriaAnimais } from "@/services/BiometriaAnimalService"
import { usePermissions } from "@/contexts/PermissionsContext"

interface AbaBiometriaProps {
    animalId: number
}

export function AbaBiometria({ animalId }: AbaBiometriaProps) {
    const navigate = useNavigate()
    const { hasPermission } = usePermissions()
    const [biometrias, setBiometrias] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        setLoading(true)
        getBiometriaAnimais({ animalId, page, pageSize })
            .then((data) => {
                const sorted = [...data.items].sort(
                    (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
                )
                setBiometrias(sorted)
                setTotalCount(data.totalCount)
            })
            .catch((err) => console.error("Erro ao buscar biometrias do animal:", err))
            .finally(() => setLoading(false))
    }, [animalId, page, pageSize])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {biometrias.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    Nenhum registro de biometria encontrado para este animal.
                </div>
            ) : (
                biometrias.map((item) => {
                    const dataOk = item.dataBiometria && !item.dataBiometria.startsWith("0001")
                    return (
                        <HorizontalCard
                            key={item.id}
                            title={
                                dataOk
                                    ? new Date(item.dataBiometria).toLocaleDateString("pt-BR")
                                    : "-"
                            }
                            infoBlocks={[
                                {
                                    label: "Peso (g)",
                                    value:
                                        !item.peso || item.peso === 0
                                            ? "-"
                                            : Number(item.peso).toLocaleString("pt-BR", {
                                                  minimumFractionDigits: 1,
                                              }),
                                },
                                {
                                    label: "Compr. (cm)",
                                    value:
                                        !item.comprimento || item.comprimento === 0
                                            ? "-"
                                            : Number(item.comprimento).toLocaleString("pt-BR", {
                                                  minimumFractionDigits: 1,
                                              }),
                                },
                                {
                                    label: "Cauda (cm)",
                                    value:
                                        !item.comprimentoCauda || item.comprimentoCauda === 0
                                            ? "-"
                                            : Number(item.comprimentoCauda).toLocaleString("pt-BR", {
                                                  minimumFractionDigits: 1,
                                              }),
                                },
                            ]}
                            onClick={hasPermission("Biometria", "Editar") ? () =>
                                navigate(`/biometria/cadastro/${item.id}?animalId=${animalId}`)
                            : undefined}
                        />
                    )
                })
            )}

            {biometrias.length > 0 && (
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
