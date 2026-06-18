import { apiFetch } from './api';
import type { DashboardStats } from '@/types/dashboard';

export function fetchDashboardStats() {
  return apiFetch<DashboardStats>('/dashboard/stats', {
    requireSession: true,
  });
}
