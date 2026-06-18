'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Camera, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CreateButton } from '@/components/shared/create-button';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorAlert } from '@/components/shared/error-alert';
import { PageHeader } from '@/components/shared/page-header';
import { PaginatedFooter } from '@/components/shared/paginated-footer';
import { CrewFormDialog } from '@/components/resources/crew-form-dialog';
import type { CrewFormValues } from '@/components/resources/crew-form-fields';
import { CrewTable } from '@/components/resources/crew-table';
import { EquipmentFormDialog } from '@/components/resources/equipment-form-dialog';
import type { EquipmentFormValues } from '@/components/resources/equipment-form-fields';
import { EquipmentTable } from '@/components/resources/equipment-table';
import { getCrewMember } from '@/lib/crew';
import { getEquipmentItem } from '@/lib/equipment';
import { useListQuery } from '@/hooks/use-list-query';
import { useCrewStore } from '@/stores/crew-store';
import { useEquipmentStore } from '@/stores/equipment-store';
import type { CrewMemberSummary } from '@/types/crew';
import type { EquipmentSummary } from '@/types/equipment';

type ResourceTab = 'crew' | 'equipment';

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
      <ResourcesPageContent />
    </Suspense>
  );
}

function ResourcesPageContent() {
  const pathname = usePathname();
  const {
    queryParams,
    setPage,
    sort,
    order,
    defaultSort,
    defaultOrder,
    setSort,
    clearSort,
  } = useListQuery({ defaultSort: 'name', defaultOrder: 'asc' });
  const [tab, setTab] = useState<ResourceTab>('crew');

  const {
    crew,
    pagination: crewPagination,
    total: crewTotal,
    isLoading: crewLoading,
    isSaving: crewSaving,
    error: crewError,
    fetchCrew,
    fetchCrewTotal,
    createCrewMember,
    updateCrewMember,
    deleteCrewMember,
    clearError: clearCrewError,
  } = useCrewStore();

  const {
    equipment,
    pagination: equipmentPagination,
    total: equipmentTotal,
    isLoading: equipmentLoading,
    isSaving: equipmentSaving,
    error: equipmentError,
    fetchEquipment,
    fetchEquipmentTotal,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    clearError: clearEquipmentError,
  } = useEquipmentStore();

  const [crewDialogOpen, setCrewDialogOpen] = useState(false);
  const [crewDialogMode, setCrewDialogMode] = useState<'create' | 'edit'>('create');
  const [crewEditId, setCrewEditId] = useState<string | null>(null);
  const [crewFormInitial, setCrewFormInitial] = useState<CrewFormValues>();

  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [equipmentDialogMode, setEquipmentDialogMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [equipmentEditId, setEquipmentEditId] = useState<string | null>(null);
  const [equipmentFormInitial, setEquipmentFormInitial] =
    useState<EquipmentFormValues>();

  const [deleteCrewTarget, setDeleteCrewTarget] =
    useState<CrewMemberSummary | null>(null);
  const [deleteEquipmentTarget, setDeleteEquipmentTarget] =
    useState<EquipmentSummary | null>(null);

  useEffect(() => {
    if (pathname !== '/resources') return;

    void fetchCrewTotal();
    void fetchEquipmentTotal();

    if (tab === 'crew') {
      void fetchCrew(queryParams);
      return;
    }

    void fetchEquipment(queryParams);
  }, [
    pathname,
    tab,
    queryParams,
    fetchCrew,
    fetchCrewTotal,
    fetchEquipment,
    fetchEquipmentTotal,
  ]);

  const tableSort = {
    sort,
    order,
    defaultSort,
    defaultOrder,
    onSort: setSort,
  };

  function handleTabChange(value: string) {
    setTab(value as ResourceTab);
    setPage(1);
    clearSort();
  }

  async function openCrewEdit(member: CrewMemberSummary) {
    const detail = await getCrewMember(member.id);
    setCrewEditId(member.id);
    setCrewDialogMode('edit');
    setCrewFormInitial({
      name: detail.name,
      role: detail.role,
      email: detail.email ?? '',
      phone: detail.phone ?? '',
      notes: detail.notes ?? '',
    });
    setCrewDialogOpen(true);
  }

  function openCrewCreate() {
    setCrewEditId(null);
    setCrewDialogMode('create');
    setCrewFormInitial(undefined);
    setCrewDialogOpen(true);
  }

  async function openEquipmentEdit(item: EquipmentSummary) {
    const detail = await getEquipmentItem(item.id);
    setEquipmentEditId(item.id);
    setEquipmentDialogMode('edit');
    setEquipmentFormInitial({
      name: detail.name,
      category: detail.category,
      quantity: String(detail.quantity),
      notes: detail.notes ?? '',
    });
    setEquipmentDialogOpen(true);
  }

  function openEquipmentCreate() {
    setEquipmentEditId(null);
    setEquipmentDialogMode('create');
    setEquipmentFormInitial(undefined);
    setEquipmentDialogOpen(true);
  }

  async function handleCrewSave(values: CrewFormValues) {
    const payload = {
      name: values.name.trim(),
      role: values.role,
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      notes: values.notes.trim() || undefined,
    };
    if (crewDialogMode === 'edit' && crewEditId) {
      await updateCrewMember(crewEditId, payload);
    } else {
      await createCrewMember(payload);
    }
  }

  async function handleEquipmentSave(values: EquipmentFormValues) {
    const payload = {
      name: values.name.trim(),
      category: values.category,
      quantity: Number.parseInt(values.quantity, 10),
      notes: values.notes.trim() || undefined,
    };
    if (equipmentDialogMode === 'edit' && equipmentEditId) {
      await updateEquipment(equipmentEditId, payload);
    } else {
      await createEquipment(payload);
    }
  }

  async function handleDeleteCrew() {
    if (!deleteCrewTarget) return;
    const nextPage = await deleteCrewMember(deleteCrewTarget.id, queryParams.page);
    setDeleteCrewTarget(null);
    if (nextPage !== queryParams.page) setPage(nextPage);
  }

  async function handleDeleteEquipment() {
    if (!deleteEquipmentTarget) return;
    const nextPage = await deleteEquipment(
      deleteEquipmentTarget.id,
      queryParams.page,
    );
    setDeleteEquipmentTarget(null);
    if (nextPage !== queryParams.page) setPage(nextPage);
  }

  const activePagination = tab === 'crew' ? crewPagination : equipmentPagination;
  const activeError = tab === 'crew' ? crewError : equipmentError;
  const clearActiveError = tab === 'crew' ? clearCrewError : clearEquipmentError;
  const isEmpty =
    tab === 'crew'
      ? !crewLoading && crewTotal === 0
      : !equipmentLoading && equipmentTotal === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resources"
        description="Your crew roster and equipment inventory. Assign them to a production when you're ready to staff a show."
      >
        {tab === 'crew' ? (
          <CreateButton onClick={openCrewCreate}>Add Crew Member</CreateButton>
        ) : (
          <CreateButton onClick={openEquipmentCreate}>Add Equipment</CreateButton>
        )}
      </PageHeader>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="crew">Crew ({crewTotal})</TabsTrigger>
          <TabsTrigger value="equipment">Equipment ({equipmentTotal})</TabsTrigger>
        </TabsList>

        <ErrorAlert
          message={activeError ?? ''}
          onDismiss={clearActiveError}
          className="mt-4"
        />

        <TabsContent value="crew" className="mt-4 space-y-4">
          {isEmpty ? (
            <EmptyState
              icon={Users}
              title="No crew members yet"
              description="Add camera operators, audio engineers, talent, and other people you work with."
              action={
                <CreateButton onClick={openCrewCreate}>
                  Add Crew Member
                </CreateButton>
              }
            />
          ) : (
            <>
              <CrewTable
                data={crew}
                isLoading={crewLoading}
                sort={tableSort}
                onRowClick={openCrewEdit}
                onEdit={openCrewEdit}
                onDelete={setDeleteCrewTarget}
              />
              {activePagination && (
                <PaginatedFooter
                  meta={activePagination}
                  onPageChange={setPage}
                  itemLabel="crew members"
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4 space-y-4">
          {isEmpty ? (
            <EmptyState
              icon={Camera}
              title="No equipment yet"
              description="Track cameras, mixers, mics, and other gear you use on productions."
              action={
                <CreateButton onClick={openEquipmentCreate}>
                  Add Equipment
                </CreateButton>
              }
            />
          ) : (
            <>
              <EquipmentTable
                data={equipment}
                isLoading={equipmentLoading}
                sort={tableSort}
                onRowClick={openEquipmentEdit}
                onEdit={openEquipmentEdit}
                onDelete={setDeleteEquipmentTarget}
              />
              {activePagination && (
                <PaginatedFooter
                  meta={activePagination}
                  onPageChange={setPage}
                  itemLabel="equipment items"
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <CrewFormDialog
        open={crewDialogOpen}
        mode={crewDialogMode}
        initialValues={crewFormInitial}
        isSaving={crewSaving}
        onOpenChange={setCrewDialogOpen}
        onSave={handleCrewSave}
      />

      <EquipmentFormDialog
        open={equipmentDialogOpen}
        mode={equipmentDialogMode}
        initialValues={equipmentFormInitial}
        isSaving={equipmentSaving}
        onOpenChange={setEquipmentDialogOpen}
        onSave={handleEquipmentSave}
      />

      <ConfirmDialog
        open={!!deleteCrewTarget}
        title="Remove Crew Member?"
        description={
          deleteCrewTarget
            ? `Remove "${deleteCrewTarget.name}" from your crew roster? They will be unassigned from any productions.`
            : ''
        }
        confirmLabel="Remove"
        variant="destructive"
        isLoading={crewSaving}
        onConfirm={handleDeleteCrew}
        onCancel={() => setDeleteCrewTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteEquipmentTarget}
        title="Remove equipment?"
        description={
          deleteEquipmentTarget
            ? `Remove "${deleteEquipmentTarget.name}" from your inventory? It will be unassigned from any productions.`
            : ''
        }
        confirmLabel="Remove"
        variant="destructive"
        isLoading={equipmentSaving}
        onConfirm={handleDeleteEquipment}
        onCancel={() => setDeleteEquipmentTarget(null)}
      />
    </div>
  );
}
