import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  pageSize?: number;
}

export function DataTable<TData>({ columns, data, isLoading, pageSize = 10 }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  return (
    <div className="sqb-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b text-[11px] uppercase tracking-wider text-gray-400 font-bold shrink-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors select-none",
                      idx === 0 && "border-r w-12 text-center",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp size={12} />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown size={12} />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm font-medium text-sqb-navy">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-20 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-sqb-navy/30 border-t-sqb-navy rounded-full animate-spin" />
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-gray-50 hover:bg-gray-50 transition-colors",
                    row.getIsSelected() && "bg-blue-50/30"
                  )}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-4",
                        idx === 0 && "border-r text-center"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-20 text-center text-gray-400">
                  No records found in the current audit period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-auto p-4 border-t flex items-center justify-between bg-gray-50/50 rounded-b-xl">
        <span className="text-xs text-gray-500 font-medium">
          Showing {table.getRowModel().rows.length} of {data.length} entries
          {pageCount > 1 && ` (Page ${currentPage + 1} of ${pageCount})`}
        </span>
        {pageCount > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-gray-200 rounded bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              let pageIdx = i;
              if (pageCount > 5) {
                const start = Math.max(0, Math.min(currentPage - 2, pageCount - 5));
                pageIdx = start + i;
              }
              return (
                <button
                  key={pageIdx}
                  onClick={() => table.setPageIndex(pageIdx)}
                  className={cn(
                    "px-3 py-1 rounded font-bold text-xs",
                    currentPage === pageIdx
                      ? "bg-sqb-navy text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {pageIdx + 1}
                </button>
              );
            })}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-gray-200 rounded bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
