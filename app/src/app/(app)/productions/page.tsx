'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clapperboard } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CreateButton } from '@/components/shared/create-button';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { PageHeader } from '@/components/shared/page-header';
import { PaginatedFooter } from '@/components/shared/paginated-footer';
import { ListSearchField } from '@/components/shared/list-search-field';
import { ProductionsTable } from '@/components/productions/productions-table';
import { useListQuery } from '@/hooks/use-list-query';
import { useProductionsStore } from '@/stores/productions-store';
import type {
  ProductionStatus,
  ProductionSummary,
} from '@/types/production';

export default function ProductionsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
      <ProductionsPageContent />
    </Suspense>
  );
}

function ProductionsPageContent() {
  const router = useRouter();
  const {
    queryParams,
    setPage,
    sort,
    order,
    defaultSort,
    defaultOrder,
    setSort,
    search,
    inputValue,
    setInputValue,
    clearSearch,
  } = useListQuery({ defaultSort: 'eventDate', defaultOrder: 'desc' });
  const {
    productions,
    pagination,
    isLoading,
    isSaving,
    error,
    fetchProductions,
    updateProduction,
    deleteProduction,
    clearError,
  } = useProductionsStore();

  const [deleteTarget, setDeleteTarget] = useState<ProductionSummary | null>(
    null,
  );

  useEffect(() => {
    fetchProductions(queryParams);
  }, [fetchProductions, queryParams]);

  const tableSort = {
    sort,
    order,
    defaultSort,
    defaultOrder,
    onSort: setSort,
  };

  async function handleDelete() {
    if (!deleteTarget) return;
    const nextPage = await deleteProduction(deleteTarget.id, queryParams.page);
    setDeleteTarget(null);
    if (nextPage !== queryParams.page) setPage(nextPage);
  }

  async function handleStatusChange(
    production: ProductionSummary,
    status: ProductionStatus,
  ) {
    try {
      await updateProduction(production.id, { status });
    } catch {
      // error surfaced via store
    }
  }

  const showInitialEmpty = !isLoading && !search && (pagination?.total ?? 0) === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Productions"
        description="Plan your livestream shows and run-of-show segments."
      >
        <CreateButton href="/productions/new">New Production</CreateButton>
      </PageHeader>

      <ErrorAlert message={error ?? ''} onDismiss={clearError} />

      {showInitialEmpty ? (
        <EmptyState
          icon={Clapperboard}
          title="No productions yet"
          description="Create your first production with a run sheet to get started."
          action={
            <CreateButton href="/productions/new">New Production</CreateButton>
          }
        />
      ) : (
        <>
          <ListSearchField
            value={inputValue}
            onChange={setInputValue}
            onClear={clearSearch}
            placeholder="Search productions…"
            disabled={isLoading}
          />
          <ProductionsTable
            data={productions}
            isLoading={isLoading}
            sort={tableSort}
            onRowClick={(id) => router.push(`/productions/${id}`)}
            onStatusChange={handleStatusChange}
            onDelete={setDeleteTarget}
          />
          {pagination && (
            <PaginatedFooter
              meta={pagination}
              onPageChange={setPage}
              itemLabel="productions"
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove production?"
        description={
          deleteTarget
            ? `This will permanently remove "${deleteTarget.title}" and its run sheet.`
            : ''
        }
        confirmLabel="Remove"
        variant="destructive"
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
