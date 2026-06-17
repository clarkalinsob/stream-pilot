'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { FormDialog } from '@/components/shared/form-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CrewRoleBadge } from '@/components/resources/crew-role-badge';
import { EquipmentCategoryBadge } from '@/components/resources/equipment-category-badge';
import { listCrew } from '@/lib/crew';
import { listEquipment } from '@/lib/equipment';
import { cn } from '@/lib/utils';
import type { CrewMemberSummary } from '@/types/crew';
import type { EquipmentSummary } from '@/types/equipment';
import type { ReplaceAssignmentsData } from '@/types/production';

type AssignmentPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCrewIds: string[];
  initialEquipment: { equipmentId: string; quantity: number }[];
  isSaving: boolean;
  onSave: (data: ReplaceAssignmentsData) => Promise<void>;
};

export function AssignmentPickerDialog({
  open,
  onOpenChange,
  initialCrewIds,
  initialEquipment,
  isSaving,
  onSave,
}: AssignmentPickerDialogProps) {
  const [crew, setCrew] = useState<CrewMemberSummary[]>([]);
  const [equipment, setEquipment] = useState<EquipmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<
    { equipmentId: string; quantity: number }[]
  >([]);

  useEffect(() => {
    if (!open) return;
    setSelectedCrewIds(initialCrewIds);
    setSelectedEquipment(initialEquipment);
    setSearch('');
    setIsLoading(true);
    Promise.all([
      listCrew({ page: 1, limit: 50 }),
      listEquipment({ page: 1, limit: 50 }),
    ])
      .then(([crewResult, equipmentResult]) => {
        setCrew(crewResult.data);
        setEquipment(equipmentResult.data);
      })
      .finally(() => setIsLoading(false));
  }, [open, initialCrewIds, initialEquipment]);

  const query = search.trim().toLowerCase();
  const filteredCrew = crew.filter(
    (m) =>
      !query ||
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query),
  );
  const filteredEquipment = equipment.filter(
    (item) =>
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query),
  );

  function toggleCrew(id: string) {
    setSelectedCrewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleEquipment(id: string) {
    setSelectedEquipment((prev) => {
      const exists = prev.find((x) => x.equipmentId === id);
      if (exists) return prev.filter((x) => x.equipmentId !== id);
      return [...prev, { equipmentId: id, quantity: 1 }];
    });
  }

  function isEquipmentSelected(id: string) {
    return selectedEquipment.some((x) => x.equipmentId === id);
  }

  async function handleSubmit() {
    try {
      await onSave({
        crewMemberIds: selectedCrewIds,
        equipment: selectedEquipment,
      });
      onOpenChange(false);
    } catch {
      // error surfaced via store
    }
  }

  return (
    <FormDialog
      open={open}
      title="Assign Resources"
      description="Select crew and equipment from your inventory."
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="Save Assignments"
      isLoading={isSaving || isLoading}
      submitDisabled={isLoading}
      contentClassName="min-w-0 overflow-hidden sm:max-w-lg"
    >
      <div className="min-w-0 space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          disabled={isLoading}
          className="h-8 text-sm"
        />

        <Tabs defaultValue="crew" className="min-w-0">
          <TabsList className="h-8 w-full">
            <TabsTrigger value="crew" className="flex-1 text-xs">
              Crew ({selectedCrewIds.length})
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex-1 text-xs">
              Equipment ({selectedEquipment.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="crew"
            className="mt-2 max-h-64 min-w-0 space-y-1 overflow-x-hidden overflow-y-auto"
          >
            {filteredCrew.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Loading…' : 'No crew members found.'}
              </p>
            ) : (
              filteredCrew.map((member) => {
                const selected = selectedCrewIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    disabled={isSaving}
                    onClick={() => toggleCrew(member.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate" title={member.name}>
                      {member.name}
                    </span>
                    <CrewRoleBadge role={member.role} size="sm" />
                    {selected ? (
                      <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                    ) : null}
                  </button>
                );
              })
            )}
          </TabsContent>

          <TabsContent
            value="equipment"
            className="mt-2 max-h-64 min-w-0 space-y-1 overflow-x-hidden overflow-y-auto"
          >
            {filteredEquipment.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Loading…' : 'No equipment found.'}
              </p>
            ) : (
              filteredEquipment.map((item) => {
                const selected = isEquipmentSelected(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isSaving}
                    onClick={() => toggleEquipment(item.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate" title={item.name}>
                      {item.name}
                    </span>
                    <EquipmentCategoryBadge category={item.category} size="sm" />
                    {selected ? (
                      <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                    ) : null}
                  </button>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FormDialog>
  );
}
