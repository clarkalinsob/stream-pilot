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
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (!open) return;
    setSelectedCrewIds(initialCrewIds);
    setSelectedEquipment(initialEquipment);
    setQuantityDrafts({});
    setSearch('');
    setIsLoading(true);
    Promise.all([
      listCrew({ page: 1, limit: 50 }),
      listEquipment({ page: 1, limit: 50 }),
    ])
      .then(([crewResult, equipmentResult]) => {
        setCrew(crewResult.data);
        setEquipment(equipmentResult.data);
        setSelectedEquipment((prev) =>
          prev.map((selection) => {
            const item = equipmentResult.data.find(
              (entry) => entry.id === selection.equipmentId,
            );
            if (!item) return selection;
            return {
              ...selection,
              quantity: Math.min(
                Math.max(1, selection.quantity),
                item.quantity,
              ),
            };
          }),
        );
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
    const exists = selectedEquipment.some((entry) => entry.equipmentId === id);

    if (exists) {
      setQuantityDrafts((drafts) => {
        const next = { ...drafts };
        delete next[id];
        return next;
      });
      setSelectedEquipment((prev) =>
        prev.filter((entry) => entry.equipmentId !== id),
      );
      return;
    }

    setSelectedEquipment((prev) => [...prev, { equipmentId: id, quantity: 1 }]);
  }

  function clampEquipmentQuantity(raw: string, maxQuantity: number): number {
    const parsed = Number.parseInt(raw.trim(), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return 1;
    }
    return Math.min(parsed, maxQuantity);
  }

  function getQuantityInputValue(id: string, committedQuantity: number) {
    return quantityDrafts[id] ?? String(committedQuantity);
  }

  function setEquipmentQuantityDraft(id: string, raw: string) {
    if (raw !== '' && !/^\d+$/.test(raw)) {
      return;
    }

    setQuantityDrafts((prev) => ({ ...prev, [id]: raw }));
  }

  function commitEquipmentQuantity(id: string, rawValue?: string) {
    const item = equipment.find((entry) => entry.id === id);
    if (!item) return;

    const raw = rawValue ?? quantityDrafts[id];
    if (raw === undefined) return;

    const quantity = clampEquipmentQuantity(raw, item.quantity);

    setSelectedEquipment((prev) =>
      prev.map((entry) =>
        entry.equipmentId === id ? { ...entry, quantity } : entry,
      ),
    );
    setQuantityDrafts((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function commitAllEquipmentQuantities(
    equipmentSelection: { equipmentId: string; quantity: number }[],
  ) {
    return equipmentSelection.map((selection) => {
      const item = equipment.find((entry) => entry.id === selection.equipmentId);
      if (!item) return selection;

      const draft = quantityDrafts[selection.equipmentId];
      if (draft === undefined) {
        return selection;
      }

      return {
        ...selection,
        quantity: clampEquipmentQuantity(draft, item.quantity),
      };
    });
  }

  function getEquipmentSelection(id: string) {
    return selectedEquipment.find((x) => x.equipmentId === id);
  }

  const hasInvalidEquipmentQuantity = selectedEquipment.some((selection) => {
    const item = equipment.find((entry) => entry.id === selection.equipmentId);
    if (!item) return true;

    const raw = quantityDrafts[selection.equipmentId] ?? String(selection.quantity);
    const parsed = Number.parseInt(raw.trim(), 10);
    return (
      Number.isNaN(parsed) ||
      parsed < 1 ||
      parsed > item.quantity
    );
  });

  async function handleSubmit() {
    const equipment = commitAllEquipmentQuantities(selectedEquipment);

    try {
      await onSave({
        crewMemberIds: selectedCrewIds,
        equipment,
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
      submitDisabled={isLoading || hasInvalidEquipmentQuantity}
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
                const selection = getEquipmentSelection(item.id);
                const selected = !!selection;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => toggleEquipment(item.id)}
                      aria-pressed={selected}
                      className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left"
                    >
                      <span className="min-w-0 flex-1 truncate" title={item.name}>
                        {item.name}
                      </span>
                      <EquipmentCategoryBadge category={item.category} size="sm" />
                      {selected ? (
                        <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
                      ) : null}
                    </button>
                    {selected ? (
                      <div
                        className="flex shrink-0 items-center gap-1.5"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <label
                          htmlFor={`equipment-qty-${item.id}`}
                          className="sr-only"
                        >
                          Quantity for {item.name}
                        </label>
                        <Input
                          id={`equipment-qty-${item.id}`}
                          type="text"
                          inputMode="numeric"
                          value={getQuantityInputValue(item.id, selection.quantity)}
                          disabled={isSaving}
                          onChange={(event) =>
                            setEquipmentQuantityDraft(item.id, event.target.value)
                          }
                          onBlur={(event) =>
                            commitEquipmentQuantity(item.id, event.target.value)
                          }
                          className="h-7 w-14 px-2 text-center text-xs"
                        />
                        <span className="text-xs text-muted-foreground">
                          / {item.quantity}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FormDialog>
  );
}
