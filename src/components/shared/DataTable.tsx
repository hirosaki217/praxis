import type { Key, ReactNode } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState, LoadingState } from './async-states'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTablePagination {
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => Key
  loading?: boolean
  caption?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  pagination?: DataTablePagination
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  caption,
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription,
  className,
  pagination,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingState className={className} />
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />
  }

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 0

  return (
    <div className={cn('space-y-4', className)}>
      <Table>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination ? (
        <Pagination className='justify-between'>
          <div className='text-sm text-muted-foreground'>
            Trang {pagination.page} / {totalPages} · {pagination.total} dòng
          </div>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                text='Trước'
                onClick={(event) => {
                  event.preventDefault()
                  if (pagination.page > 1) pagination.onPageChange?.(pagination.page - 1)
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
              const page = index + 1
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href='#'
                    isActive={page === pagination.page}
                    onClick={(event) => {
                      event.preventDefault()
                      pagination.onPageChange?.(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                href='#'
                text='Sau'
                onClick={(event) => {
                  event.preventDefault()
                  if (pagination.page < totalPages) pagination.onPageChange?.(pagination.page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
