import { useState, useEffect, useMemo } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/pagination-bar";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  highlightedColumns?: string[];
  defaultSortKey?: keyof T;
  defaultSortDirection?: "asc" | "desc";
  serverPagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  tableClassName?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  onRowClick,
  highlightedColumns = [],
  defaultSortKey,
  defaultSortDirection,
  serverPagination,
  tableClassName,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc" | null;
  }>({ key: defaultSortKey || null, direction: defaultSortDirection || null });

  const isServerPaginated = !!serverPagination;

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];
      
      if (aVal === bVal) return 0;
      if (aVal == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bVal == null) return sortConfig.direction === "asc" ? 1 : -1;
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      if (aVal instanceof Date && bVal instanceof Date) {
         return sortConfig.direction === "asc"
           ? aVal.getTime() - bVal.getTime()
           : bVal.getTime() - aVal.getTime();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      
      return 0;
    });
  }, [data, sortConfig, isServerPaginated, serverPagination]);

  const totalItems = isServerPaginated ? serverPagination!.totalCount : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / (isServerPaginated ? serverPagination!.pageSize : itemsPerPage)));
  const safePage = isServerPaginated ? serverPagination!.page : Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * (isServerPaginated ? serverPagination!.pageSize : itemsPerPage);
  const endIndex = Math.min(startIndex + (isServerPaginated ? serverPagination!.pageSize : itemsPerPage), totalItems);
  const paginatedData = isServerPaginated ? sortedData : sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (isServerPaginated) {
      serverPagination!.onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (isServerPaginated) {
      serverPagination!.onPageSizeChange(size);
    } else {
      setItemsPerPage(size);
      setCurrentPage(1);
    }
  };

  const handleSort = (key?: keyof T, sortable?: boolean) => {
    if (!key || sortable === false) return;

    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === "asc") return { key, direction: "desc" };
        if (current.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-card shadow-sm">
        <table className={`w-full ${columns.some(c => c.width) ? "table-fixed" : ""} ${tableClassName || ""}`}>
          <thead className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900/60">
            <tr>
              {columns.map((col, idx) => {
                const isHighlighted = highlightedColumns.includes(col.header);
                const isSortable = !!col.accessorKey && col.sortable === true;
                const isSorted = sortConfig.key === col.accessorKey;

                return (
                  <th
                    key={idx}
                    className={`px-4 py-3 text-sm font-medium text-zinc-200 dark:text-zinc-200 whitespace-nowrap ${col.headerClassName || "text-left"} ${isHighlighted ? "bg-yellow-100 dark:bg-yellow-900/30" : ""} ${isSortable ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" : ""}`}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={
                      isSortable
                        ? () => handleSort(col.accessorKey, true)
                        : undefined}
                  >
                    <div className={`flex items-center gap-1 ${col.headerClassName?.includes("text-center") ? "justify-center" : col.headerClassName?.includes("text-right") ? "justify-end" : ""}`}>
                      {col.header}
                      {isSortable && (
                        <span className="inline-flex flex-col justify-center text-zinc-400 dark:text-zinc-400">
                          {isSorted && sortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          ) : isSorted && sortConfig.direction === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-4 text-center text-zinc-400 dark:text-zinc-400"
                >
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-4 text-center text-zinc-400 dark:text-zinc-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${onRowClick ? "cursor-pointer" : ""
                    }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, colIdx) => {
                    const isHighlighted = highlightedColumns.includes(col.header);
                    return (
                      <td key={colIdx} className={`px-4 py-3 text-sm text-zinc-100 dark:text-zinc-100 ${isHighlighted ? "bg-yellow-50 dark:bg-yellow-900/20" : ""} ${col.cellClassName || "text-left"}`}>
                        {col.cell ? col.cell(item) : (item as any)[col.accessorKey as string]}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <PaginationBar
          currentPage={safePage}
          pageSize={isServerPaginated ? serverPagination!.pageSize : itemsPerPage}
          totalCount={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </>
  );
}
