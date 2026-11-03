import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationBarProps {
    currentPage: number
    pageSize: number
    totalCount: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export function PaginationBar({ currentPage, pageSize, totalCount, onPageChange, onPageSizeChange }: PaginationBarProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const safePage = Math.min(currentPage, totalPages)
    const startIndex = (safePage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalCount)

    const getPageNumbers = (): (number | "...")[] => {
        const pages: (number | "...")[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (safePage > 3) pages.push("...")
            const start = Math.max(2, safePage - 1)
            const end = Math.min(totalPages - 1, safePage + 1)
            for (let i = start; i <= end; i++) pages.push(i)
            if (safePage < totalPages - 2) pages.push("...")
            pages.push(totalPages)
        }
        return pages
    }

    if (totalCount === 0) return null

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <p className="text-sm text-gray-600 order-2 sm:order-1">
                Mostrando <span className="font-semibold text-gray-900">{startIndex + 1}-{endIndex}</span> de{" "}
                <span className="font-semibold text-gray-900">{totalCount}</span> registros
            </p>

            <div className="flex items-center gap-1 order-1 sm:order-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-lg"
                    disabled={safePage <= 1}
                    onClick={() => onPageChange(safePage - 1)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                </Button>

                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm select-none">…</span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === safePage ? "default" : "outline"}
                            size="sm"
                            className={`h-9 w-9 p-0 rounded-lg text-sm ${page === safePage ? "bg-blue-800 text-white hover:bg-blue-900" : ""}`}
                            onClick={() => onPageChange(page as number)}
                        >
                            {page}
                        </Button>
                    )
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-lg"
                    disabled={safePage >= totalPages}
                    onClick={() => onPageChange(safePage + 1)}
                >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            <div className="flex items-center gap-2 order-3">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600 whitespace-nowrap">
                    Itens por página:
                </label>
                <select
                    id="itemsPerPage"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-800"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </div>
    )
}
