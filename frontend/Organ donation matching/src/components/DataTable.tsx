import type { ReactNode } from 'react'
import { EmptyState } from './PortalPrimitives'

export type DataColumn<Row> = {
  key: string
  header: string
  className?: string
  render?: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
  columns: DataColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row, index: number) => string
  emptyTitle?: string
  emptyDescription?: string
  ariaLabel: string
  footer?: ReactNode
}

export default function DataTable<Row>({ columns, rows, rowKey, emptyTitle = 'No matching records found', emptyDescription = 'Try adjusting your filters', ariaLabel, footer }: DataTableProps<Row>) {
  return <div className="portal-card overflow-hidden">
    <div className="portal-table-wrap">
      {rows.length ? <table className="w-full border-collapse text-left text-xs" aria-label={ariaLabel}>
        <thead className="bg-portal-mint-soft"><tr>{columns.map(column => <th key={column.key} className={`whitespace-nowrap border-b border-portal-border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-portal-muted ${column.className ?? ''}`}>{column.header}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={rowKey(row, index)} className="transition-colors hover:bg-portal-mint-soft/50">{columns.map(column => <td key={column.key} className={`px-4 py-3.5 align-middle text-portal-ink ${column.className ?? ''}`}>{column.render ? column.render(row) : String((row as unknown as Record<string, unknown>)[column.key] ?? '—')}</td>)}</tr>)}</tbody>
      </table> : <EmptyState title={emptyTitle} description={emptyDescription} />}
    </div>
    {footer && <div className="border-t border-portal-border">{footer}</div>}
  </div>
}
