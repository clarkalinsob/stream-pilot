import { apiFetch } from './api';
import type {
  CreateProductionData,
  PaginatedProductions,
  ProductionDetail,
  UpdateProductionData,
  RunSheetItem,
} from '@/types/production';

type ListParams = {
  page?: number;
  limit?: number;
};

export function listProductions({ page = 1, limit = 10 }: ListParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiFetch<PaginatedProductions>(`/productions?${params}`, {
    requireSession: true,
  });
}

export function getProduction(id: string) {
  return apiFetch<ProductionDetail>(`/productions/${id}`, {
    requireSession: true,
  });
}

export function createProduction(data: CreateProductionData) {
  return apiFetch<ProductionDetail>('/productions', {
    method: 'POST',
    body: JSON.stringify(data),
    requireSession: true,
  });
}

export function updateProduction(id: string, data: UpdateProductionData) {
  return apiFetch<ProductionDetail>(`/productions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    requireSession: true,
  });
}

export function replaceRunSheet(id: string, items: RunSheetItem[]) {
  return apiFetch<ProductionDetail>(`/productions/${id}/run-sheet`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
    requireSession: true,
  });
}

export function deleteProduction(id: string) {
  return apiFetch<{ ok: true }>(`/productions/${id}`, {
    method: 'DELETE',
    requireSession: true,
  });
}
