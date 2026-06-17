import { apiFetch } from './api';
import type {
  CreateEquipmentData,
  EquipmentDetail,
  PaginatedEquipment,
  UpdateEquipmentData,
} from '@/types/equipment';

type ListParams = {
  page?: number;
  limit?: number;
};

export function listEquipment({ page = 1, limit = 10 }: ListParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiFetch<PaginatedEquipment>(`/equipment?${params}`, {
    requireSession: true,
  });
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
