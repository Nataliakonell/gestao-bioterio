import {Loader2, BriefcaseMedical, Pill, FlaskConical, Paperclip, FileText, Scissors } from "lucide-react"
import { usePermissions } from "@/contexts/PermissionsContext"
import { PaginationBar } from "@/components/pagination-bar"
import { ClinicoTimelineCard, type ClinicoTimelineItem } from "./ClinicoTimelineCard"
import { PrescricoesAtivasCard } from "./PrescricoesAtivasCard"


interface ClinicoTimelineListProps {
    loading: boolean
    paginatedItems: ClinicoTimelineItem[]
    totalItems: number
    search: string
    dateRange: import("react-day-picker").DateRange | undefined
    selectedTipos: string[]
    page: number
    setPage: (p: number) => void
    pageSize: number
    setPageSize: (ps: number) => void
    getGrupoStatus: (group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]) => "Ativa" | "Suspensa" | "Cancelada"
    handleOpenDocumento: (tipo: any, atendimentoId: number, solicitacoesGroup?: any) => void
    handleEditDocumento: (tipo: any, id: number) => void
    handleOpenExameDocumento: (group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]) => void
    setExameSuspensaoModal: (data: { group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[] } | null) => void

    onOpenAtendimento: () => void
    onOpenPrescricao: () => void
    onOpenExame: () => void
    onOpenAnexo: () => void
    onOpenEvolucao: () => void
    onOpenProcedimento: () => void
    animalId: number
    prescricoesRefreshKey?: number
}

export function ClinicoTimelineList({
    loading,
    paginatedItems,
    totalItems,
    search,
    dateRange,
    selectedTipos,
    page,
    setPage,
    pageSize,
    setPageSize,
    getGrupoStatus,
    handleOpenDocumento,
    handleEditDocumento,
    handleOpenExameDocumento,
    setExameSuspensaoModal,
    onOpenAtendimento,
    onOpenPrescricao,
    onOpenExame,
    onOpenAnexo,
    onOpenEvolucao,
    onOpenProcedimento,
    animalId,
    prescricoesRefreshKey = 0,
}: ClinicoTimelineListProps) {
    const { hasPermission } = usePermissions()
    return (
        <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Coluna Esquerda: Timeline */}
            <div className="flex-1 w-full min-w-0">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
                    </div>
                ) : paginatedItems.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
                        {search || dateRange?.from || selectedTipos.length > 0
                            ? "Nenhum registro encontrado para os filtros selecionados."
                            : "Nenhum registro no histórico clínico deste animal."}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {paginatedItems.map((item, index) => (
                            <ClinicoTimelineCard
                                key={item.key}
                                item={item}
                                isLast={index === paginatedItems.length - 1}
                                getGrupoStatus={getGrupoStatus}
                                handleOpenDocumento={handleOpenDocumento}
                                handleEditDocumento={handleEditDocumento}
                                handleOpenExameDocumento={handleOpenExameDocumento}
                                setExameSuspensaoModal={setExameSuspensaoModal}
                            />
                        ))}

                        <div className="pt-2">
                            <PaginationBar
                                currentPage={page}
                                pageSize={pageSize}
                                totalCount={totalItems}
                                onPageChange={setPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size)
                                    setPage(1)
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full lg:w-96 xl:w-[380px] shrink-0">
                <div className="sticky top-6 flex flex-col gap-6">
                    <div className="rounded-2xl border border-slate-200/90 bg-white px-5 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-4 shadow-xs flex flex-col gap-3">
                        <h3 className="text-base font-bold text-slate-800 mb-1">Ações rápidas</h3>

                        <button
                            type="button"
                            onClick={onOpenAtendimento}
                            disabled={!hasPermission("Atendimento veterinário", "Gerenciar")}
                            className="w-full flex items-center justify-between h-12 px-4 rounded-xl border border-blue-400 bg-blue-50/20 hover:bg-blue-50 text-blue-900 font-semibold text-sm transition-all shadow-2xs group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50/20 disabled:hover:scale-100"
                        >
                            <div className="flex items-center gap-2.5">
                                <BriefcaseMedical className="h-4 w-4 text-blue-600" />
                                <span>Atendimento</span>
                            </div>
                            <span className="text-base font-medium text-blue-600 group-hover:scale-110 transition-transform disabled:group-hover:scale-100">+</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenPrescricao}
                            disabled={!hasPermission("Atendimento veterinário", "Editar")}
                            className="w-full flex items-center justify-between h-12 px-4 rounded-xl border border-teal-400 bg-teal-50/20 hover:bg-teal-50 text-teal-900 font-semibold text-sm transition-all shadow-2xs group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-50/20 disabled:hover:scale-100"
                        >
                            <div className="flex items-center gap-2.5">
                                <Pill className="h-4 w-4 text-teal-600" />
                                <span>Prescrever medicação</span>
                            </div>
                            <span className="text-base font-medium text-teal-600 group-hover:scale-110 transition-transform disabled:group-hover:scale-100">+</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenExame}
                            disabled={!hasPermission("Atendimento veterinário", "Editar")}
                            className="w-full flex items-center justify-between h-12 px-4 rounded-xl border border-amber-400 bg-amber-50/20 hover:bg-amber-50 text-amber-900 font-semibold text-sm transition-all shadow-2xs group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-50/20 disabled:hover:scale-100"
                        >
                            <div className="flex items-center gap-2.5">
                                <FlaskConical className="h-4 w-4 text-amber-600" />
                                <span>Solicitar exame</span>
                            </div>
                            <span className="text-base font-medium text-amber-600 group-hover:scale-110 transition-transform disabled:group-hover:scale-100">+</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenAnexo}
                            disabled={!hasPermission("Atendimento veterinário", "Editar")}
                            className="w-full flex items-center justify-between h-12 px-4 rounded-xl border border-slate-300 bg-slate-50/30 hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-all shadow-2xs group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-50/30 disabled:hover:scale-100"
                        >
                            <div className="flex items-center gap-2.5">
                                <Paperclip className="h-4 w-4 text-slate-600" />
                                <span>Anexar documento</span>
                            </div>
                            <span className="text-base font-medium text-slate-600 group-hover:scale-110 transition-transform disabled:group-hover:scale-100">+</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenEvolucao}
                            disabled={!hasPermission("Atendimento veterinário", "Editar")}
                            className="w-full flex items-center justify-between h-12 px-4 rounded-xl border border-purple-400 bg-purple-50/20 hover:bg-purple-50 text-purple-900 font-semibold text-sm transition-all shadow-2xs group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-50/20 disabled:hover:scale-100"
                        >
                            <div className="flex items-center gap-2.5">
                                <FileText className="h-4 w-4 text-purple-600" />
                                <span>Registrar evolução</span>
                            </div>
                            <span className="text-base font-medium text-purple-600 group-hover:scale-110 transition-transform disabled:group-hover:scale-100">+</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenProcedimento}
                            disabled={!hasPermission("Atendimento veterinário", "Editar")}
                            className="w-full flex items-center justify-between h-12 px-4 rounded-xl border border-blue-400 bg-blue-50/20 hover:bg-blue-50 text-blue-900 font-semibold text-sm transition-all shadow-2xs group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50/20 disabled:hover:scale-100"
                        >
                            <div className="flex items-center gap-2.5">
                                <Scissors className="h-4 w-4 text-blue-600" />
                                <span>Adicionar procedimento</span>
                            </div>
                            <span className="text-base font-medium text-blue-600 group-hover:scale-110 transition-transform disabled:group-hover:scale-100">+</span>
                        </button>
                    </div>


                <PrescricoesAtivasCard animalId={animalId} refreshKey={prescricoesRefreshKey} />
            </div>
        </div>
        </div>
    )
}
