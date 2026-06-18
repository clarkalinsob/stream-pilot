'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/shared/data-table';
import {
  createSortableHeader,
  type DataTableSortState,
} from '@/components/shared/data-table-sort';
import { EquipmentCategoryBadge } from './equipment-category-badge';
import type { EquipmentSummary } from '@/types/equipment';

export function createEquipmentColumns(actions: {
  onEdit: (item: EquipmentSummary) => void;
  onDelete: (item: EquipmentSummary) => void;
}): ColumnDef<EquipmentSummary, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: createSortableHeader('Name', 'name'),
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'category',
      header: createSortableHeader('Category', 'category'),
      cell: ({ row }) => (
        <EquipmentCategoryBadge category={row.original.category} size="sm" />
      ),
    },
    {
      accessorKey: 'quantity',
      header: createSortableHeader('Quantity', 'quantity'),
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
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
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

type EquipmentTableProps = {
  data: EquipmentSummary[];
  isLoading?: boolean;
  sort?: DataTableSortState;
  onRowClick: (item: EquipmentSummary) => void;
  onEdit: (item: EquipmentSummary) => void;
  onDelete: (item: EquipmentSummary) => void;
};

export function EquipmentTable({
  data,
  isLoading,
  sort,
  onRowClick,
  onEdit,
  onDelete,
}: EquipmentTableProps) {
  const columns = createEquipmentColumns({ onEdit, onDelete });

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      sort={sort}
      onRowClick={onRowClick}
    />
  );
}
