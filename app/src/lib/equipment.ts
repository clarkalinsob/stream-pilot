import { apiFetch } from './api';
import { buildListQueryString, type ListQueryParams } from './list-query';
import type {
  CreateEquipmentData,
  EquipmentDetail,
  PaginatedEquipment,
  UpdateEquipmentData,
} from '@/types/equipment';

export function listEquipment(params: ListQueryParams = {}) {
  return apiFetch<PaginatedEquipment>(
    `/equipment?${buildListQueryString(params)}`,
    { requireSession: true },
  );
}

export function getEquipmentItem(id: string) {
  return apiFetch<EquipmentDetail>(`/equipment/${id}`, {
    requireSession: true,
  });
}

export function createEquipment(data: CreateEquipmentData) {
  return apiFetch<EquipmentDetail>('/equipment', {
    method: 'POST',
    body: JSON.stringify(data),
    requireSession: true,
  });
}

export function updateEquipment(id: string, data: UpdateEquipmentData) {
  return apiFetch<EquipmentDetail>(`/equipment/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    requireSession: true,
  });
}

export function deleteEquipment(id: string) {
  return apiFetch<{ ok: true }>(`/equipment/${id}`, {
    method: 'DELETE',
    requireSession: true,
  });
}
