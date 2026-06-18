'use client';

import { createContext, useContext } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEffectiveSort, type SortOrder } from '@/lib/list-query';

export type DataTableSortState = {
  sort?: string;
  order: SortOrder;
  defaultSort?: string;
  defaultOrder?: SortOrder;
  onSort: (columnId: string) => void;
};

const DataTableSortContext = createContext<DataTableSortState | null>(null);

export function DataTableSortProvider({
  value,
  children,
}: {
  value: DataTableSortState | null;
  children: React.ReactNode;
}) {
  return (
    <DataTableSortContext.Provider value={value}>
      {children}
    </DataTableSortContext.Provider>
  );
}

export function useDataTableSort() {
  return useContext(DataTableSortContext);
}

type DataTableSortHeaderProps = {
  label: string;
  columnId: string;
};

export function DataTableSortHeader({
  label,
  columnId,
}: DataTableSortHeaderProps) {
  const sortState = useDataTableSort();

  if (!sortState) {
    return <span>{label}</span>;
  }

  const effective = getEffectiveSort(sortState);
  const isActive = effective.sort === columnId;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 px-2 font-medium"
      onClick={() => sortState.onSort(columnId)}
    >
      {label}
      {isActive ? (
        effective.order === 'asc' ? (
          <ArrowUp className="size-3.5" aria-hidden />
        ) : (
          <ArrowDown className="size-3.5" aria-hidden />
        )
      ) : (
        <ArrowUpDown
          className="size-3.5 text-muted-foreground/70"
          aria-hidden
        />
      )}
    </Button>
  );
}

export function createSortableHeader(label: string, columnId: string) {
  return function SortableHeader() {
    return <DataTableSortHeader label={label} columnId={columnId} />;
  };
}
