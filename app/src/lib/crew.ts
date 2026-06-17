import { apiFetch } from './api';
import type {
  CreateCrewMemberData,
  CrewMemberDetail,
  PaginatedCrew,
  UpdateCrewMemberData,
} from '@/types/crew';

type ListParams = {
  page?: number;
  limit?: number;
};

export function listCrew({ page = 1, limit = 10 }: ListParams = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiFetch<PaginatedCrew>(`/crew?${params}`, { requireSession: true });
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
