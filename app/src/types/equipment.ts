import type { PaginationMeta } from '@/types/production';

export type EquipmentCategory =
  | 'CAMERA'
  | 'AUDIO'
  | 'LIGHTING'
  | 'ELECTRICAL'
  | 'VIDEO'
  | 'LAPTOP'
  | 'PC'
  | 'OTHER';

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

export type PaginatedEquipment = {
  data: EquipmentSummary[];
  meta: PaginationMeta;
};

export type CreateEquipmentData = {
  name: string;
  category: EquipmentCategory;
  quantity?: number;
  notes?: string;
};

export type UpdateEquipmentData = {
  name?: string;
  category?: EquipmentCategory;
  quantity?: number;
  notes?: string;
};
