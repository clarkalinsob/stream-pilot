'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/shared/data-table';
import {
  createSortableHeader,
  type DataTableSortState,
} from '@/components/shared/data-table-sort';
import {
  formatDuration,
  formatEventDate,
  formatTimeValue,
} from '@/lib/format';
import type { ProductionSummary } from '@/types/production';
import {
  getProductionStatusLabel,
  PRODUCTION_STATUSES,
  ProductionStatusBadge,
} from './status-badge';
import type { ProductionStatus } from '@/types/production';

export function createProductionColumns(actions: {
  onView: (id: string) => void;
  onStatusChange: (
    production: ProductionSummary,
    status: ProductionStatus,
  ) => void;
  onDelete: (production: ProductionSummary) => void;
}): ColumnDef<ProductionSummary, unknown>[] {
  return [
    {
      accessorKey: 'title',
      header: createSortableHeader('Title', 'title'),
      cell: ({ row }) => row.original.title,
    },
    {
      accessorKey: 'eventDate',
      header: createSortableHeader('Event Date', 'eventDate'),
      cell: ({ row }) => formatEventDate(row.original.eventDate),
    },
    {
      id: 'startTime',
      header: createSortableHeader('Start Time', 'startTime'),
      cell: ({ row }) => formatTimeValue(row.original.startTime),
    },
    {
      id: 'endTime',
      header: createSortableHeader('End Time', 'endTime'),
      cell: ({ row }) => formatTimeValue(row.original.endTime),
    },
    {
      accessorKey: 'status',
      header: createSortableHeader('Status', 'status'),
      cell: ({ row }) => <ProductionStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'segmentCount',
      header: createSortableHeader('Segments', 'segmentCount'),
    },
    {
      accessorKey: 'totalDurationMinutes',
      header: 'Duration',
      cell: ({ row }) => formatDuration(row.original.totalDurationMinutes),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => actions.onView(row.original.id)}
            >
              Manage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {PRODUCTION_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === row.original.status}
                onClick={() => actions.onStatusChange(row.original, status)}
              >
                {getProductionStatusLabel(status)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => actions.onDelete(row.original)}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

type ProductionsTableProps = {
  data: ProductionSummary[];
  isLoading?: boolean;
  sort?: DataTableSortState;
  onRowClick: (id: string) => void;
  onStatusChange: (
    production: ProductionSummary,
    status: ProductionStatus,
  ) => void;
  onDelete: (production: ProductionSummary) => void;
};

export function ProductionsTable({
  data,
  isLoading,
  sort,
  onRowClick,
  onStatusChange,
  onDelete,
}: ProductionsTableProps) {
  const columns = createProductionColumns({
    onView: onRowClick,
    onStatusChange,
    onDelete,
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      sort={sort}
      onRowClick={(row) => onRowClick(row.id)}
    />
  );
}
