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
import { ProductionsTable } from '@/components/productions/productions-table';
import { usePagination } from '@/hooks/use-pagination';
import { useProductionsStore } from '@/stores/productions-store';
import type { ProductionSummary } from '@/types/production';

export default function ProductionsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
      <ProductionsPageContent />
    </Suspense>
  );
}

function ProductionsPageContent() {
  const router = useRouter();
  const { page, setPage, limit } = usePagination();
  const {
    productions,
    pagination,
    isLoading,
    isSaving,
    error,
    fetchProductions,
    deleteProduction,
    clearError,
  } = useProductionsStore();

  const [deleteTarget, setDeleteTarget] = useState<ProductionSummary | null>(
    null,
  );

  useEffect(() => {
    fetchProductions({ page, limit });
  }, [fetchProductions, page, limit]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const nextPage = await deleteProduction(deleteTarget.id, page);
    setDeleteTarget(null);
    if (nextPage !== page) setPage(nextPage);
  }

  const isEmpty = !isLoading && pagination?.total === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Productions"
        description="Plan your livestream shows and run-of-show segments."
      >
        <CreateButton href="/productions/new">New Production</CreateButton>
      </PageHeader>

      <ErrorAlert message={error ?? ''} onDismiss={clearError} />

      {isEmpty ? (
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
          <ProductionsTable
            data={productions}
            isLoading={isLoading}
            onRowClick={(id) => router.push(`/productions/${id}`)}
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
        title="Delete Production?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}" and its run sheet.`
            : ''
        }
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
