// src/components/tables/DataTable.tsx
import React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils/helpers'

export interface Column<T = any> {
  key: string
  title: string
  dataIndex?: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
}

export interface DataTableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    pageSizeOptions?: number[]
    onChange: (page: number, pageSize: number) => void
  }
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  title?: string
  className?: string
  emptyText?: string
  rowKey?: string | ((record: T) => string)
  onRowClick?: (record: T, index: number) => void
  sticky?: boolean
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  searchable = false,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  title,
  className,
  emptyText = "No data available",
  rowKey = 'id',
  onRowClick,
  sticky = false
}: DataTableProps<T>) => {

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return record[rowKey] || index.toString()
  }

  const renderCellContent = (column: Column<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(record[column.dataIndex || column.key], record, index)
    }
    
    const value = record[column.dataIndex || column.key]
    
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    // Handle dates
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
      return new Date(value).toLocaleDateString()
    }
    
    return value
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
      </svg>
      <p className="text-gray-500 text-center">{emptyText}</p>
    </div>
  )

  return (
    <Card className={cn("w-full", className)}>
      {/* Header */}
      {(title || searchable) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            
            {searchable && onSearchChange && (
              <div className="w-64">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full">
            
            {/* Table Header */}
            <thead className={cn(
              "bg-gray-50 border-b border-gray-200",
              sticky && "sticky top-0 z-10"
            )}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right"
                    )}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length}>
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                data.map((record, index) => (
                  <tr
                    key={getRowKey(record, index)}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right"
                        )}
                      >
                        {renderCellContent(column, record, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current <= 1}
                  onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
                    const pageNumber = i + 1
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.current ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => pagination.onChange(pageNumber, pagination.pageSize)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                  onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { DataTable }