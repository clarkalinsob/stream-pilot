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
import { CrewRoleBadge } from './crew-role-badge';
import type { CrewMemberSummary } from '@/types/crew';

function truncate(text: string | null, max = 40) {
  if (!text?.trim()) return '—';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function createCrewColumns(actions: {
  onEdit: (member: CrewMemberSummary) => void;
  onDelete: (member: CrewMemberSummary) => void;
}): ColumnDef<CrewMemberSummary, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <CrewRoleBadge role={row.original.role} size="sm" />,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {truncate(row.original.email)}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {truncate(row.original.phone)}
        </span>
      ),
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
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

type CrewTableProps = {
  data: CrewMemberSummary[];
  isLoading?: boolean;
  onRowClick: (member: CrewMemberSummary) => void;
  onEdit: (member: CrewMemberSummary) => void;
  onDelete: (member: CrewMemberSummary) => void;
};

export function CrewTable({
  data,
  isLoading,
  onRowClick,
  onEdit,
  onDelete,
}: CrewTableProps) {
  const columns = createCrewColumns({ onEdit, onDelete });

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onRowClick={onRowClick}
    />
  );
}
