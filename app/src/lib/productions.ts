import { apiFetch } from './api';
import { buildListQueryString, type ListQueryParams } from './list-query';
import type {
  CreateProductionData,
  PaginatedProductions,
  ProductionDetail,
  ReplaceAssignmentsData,
  UpdateProductionData,
  RunSheetItem,
} from '@/types/production';

export function listProductions(params: ListQueryParams = {}) {
  return apiFetch<PaginatedProductions>(
    `/productions?${buildListQueryString(params)}`,
    { requireSession: true },
  );
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

export function replaceAssignments(id: string, data: ReplaceAssignmentsData) {
  return apiFetch<ProductionDetail>(`/productions/${id}/assignments`, {
    method: 'PUT',
    body: JSON.stringify(data),
    requireSession: true,
  });
}

export function deleteProduction(id: string) {
  return apiFetch<{ ok: true }>(`/productions/${id}`, {
    method: 'DELETE',
    requireSession: true,
  });
}
