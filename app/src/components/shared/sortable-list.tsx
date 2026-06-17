'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortableListProps = {
  itemIds: string[];
  onReorder: (activeId: string, overId: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export function SortableList({
  itemIds,
  onReorder,
  disabled = false,
  children,
}: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

type DragHandleProps = {
  dragHandleProps: {
    ref: (element: HTMLElement | null) => void;
    attributes: React.HTMLAttributes<HTMLElement>;
    listeners: React.HTMLAttributes<HTMLElement> | undefined;
  };
  label?: string;
  className?: string;
  isDragging?: boolean;
};

export function DragHandle({
  dragHandleProps,
  label = 'Drag to reorder',
  className,
  isDragging = false,
}: DragHandleProps) {
  const { ref, attributes, listeners } = dragHandleProps;

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        'flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md',
        'text-muted-foreground hover:bg-accent hover:text-foreground',
        'active:cursor-grabbing disabled:pointer-events-none disabled:opacity-40',
        isDragging && 'cursor-grabbing bg-accent/60 text-foreground',
        className,
      )}
      aria-label={label}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  );
}

export function useSortableRow(id: string, disabled = false) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  return {
    setNodeRef,
    style: {
      transform: CSS.Transform.toString(transform),
      transition,
    },
    isDragging,
    dragHandleProps: {
      ref: setActivatorNodeRef,
      attributes,
      listeners,
    },
  };
}
