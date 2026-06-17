import { Equipment, EquipmentCategory } from '@prisma/client';

export type EquipmentSummary = {
  id: string;
  name: string;
  category: EquipmentCategory;
  quantity: number;
  assignmentCount: number;
};

export type EquipmentDetail = EquipmentSummary & {
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedEquipmentResponse = {
  data: EquipmentSummary[];
  meta: PaginationMeta;
};

type EquipmentWithCount = Equipment & {
  _count: { assignments: number };
};

export function toEquipmentSummary(item: EquipmentWithCount): EquipmentSummary {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    assignmentCount: item._count.assignments,
  };
}

export function toEquipmentDetail(item: EquipmentWithCount): EquipmentDetail {
  return {
    ...toEquipmentSummary(item),
    notes: item.notes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
