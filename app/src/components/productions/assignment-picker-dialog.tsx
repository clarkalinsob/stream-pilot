'use client';

import { useEffect, useState } from 'react';
import { FormDialog } from '@/components/shared/form-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { formatCrewRole } from '@/lib/resources';
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
      title="Assign resources"
      description="Select crew and equipment from your inventory."
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="Save assignments"
      isLoading={isSaving || isLoading}
      submitDisabled={isLoading}
      contentClassName="sm:max-w-lg"
    >
      <div className="space-y-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          disabled={isLoading}
        />

        <Tabs defaultValue="crew">
          <TabsList className="w-full">
            <TabsTrigger value="crew" className="flex-1">
              Crew ({selectedCrewIds.length})
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex-1">
              Equipment ({selectedEquipment.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crew" className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {filteredCrew.length === 0 ? (
              <p className="text-sm text-muted-foreground">
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
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCrewRole(member.role)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selected ? 'Selected' : 'Tap to select'}
                    </span>
                  </button>
                );
              })
            )}
          </TabsContent>

          <TabsContent
            value="equipment"
            className="mt-3 max-h-64 space-y-2 overflow-y-auto"
          >
            {filteredEquipment.length === 0 ? (
              <p className="text-sm text-muted-foreground">
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
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <EquipmentCategoryBadge
                        category={item.category}
                        size="sm"
                        className="mt-1"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selected ? 'Selected' : 'Tap to select'}
                    </span>
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
