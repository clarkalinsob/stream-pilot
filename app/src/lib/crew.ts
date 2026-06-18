import { apiFetch } from './api';
import { buildListQueryString, type ListQueryParams } from './list-query';
import type {
  CreateCrewMemberData,
  CrewMemberDetail,
  PaginatedCrew,
  UpdateCrewMemberData,
} from '@/types/crew';

export function listCrew(params: ListQueryParams = {}) {
  return apiFetch<PaginatedCrew>(`/crew?${buildListQueryString(params)}`, {
    requireSession: true,
  });
}

export function getCrewMember(id: string) {
  return apiFetch<CrewMemberDetail>(`/crew/${id}`, { requireSession: true });
}

export function createCrewMember(data: CreateCrewMemberData) {
  return apiFetch<CrewMemberDetail>('/crew', {
    method: 'POST',
    body: JSON.stringify(data),
    requireSession: true,
  });
}

export function updateCrewMember(id: string, data: UpdateCrewMemberData) {
  return apiFetch<CrewMemberDetail>(`/crew/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    requireSession: true,
  });
}

export function deleteCrewMember(id: string) {
  return apiFetch<{ ok: true }>(`/crew/${id}`, {
    method: 'DELETE',
    requireSession: true,
  });
}
