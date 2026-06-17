import { create } from 'zustand';
import * as equipmentApi from '@/lib/equipment';
import { ApiError } from '@/lib/api';
import type {
  CreateEquipmentData,
  EquipmentDetail,
  EquipmentSummary,
  UpdateEquipmentData,
} from '@/types/equipment';
import type { PaginationMeta } from '@/types/production';

type FetchEquipmentParams = {
  page?: number;
  limit?: number;
};

type EquipmentState = {
  equipment: EquipmentSummary[];
  pagination: PaginationMeta | null;
  total: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchEquipment: (params?: FetchEquipmentParams) => Promise<void>;
  fetchEquipmentTotal: () => Promise<void>;
  createEquipment: (data: CreateEquipmentData) => Promise<EquipmentDetail>;
  updateEquipment: (
    id: string,
    data: UpdateEquipmentData,
  ) => Promise<EquipmentDetail>;
  deleteEquipment: (id: string, currentPage?: number) => Promise<number>;
  clearError: () => void;
};

let equipmentListRequestId = 0;

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  pagination: null,
  total: 0,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchEquipmentTotal: async () => {
    try {
      const result = await equipmentApi.listEquipment({ page: 1, limit: 1 });
      set({ total: result.meta.total });
    } catch {
      // Tab counts are non-critical; list fetch will refresh total.
    }
  },

  fetchEquipment: async ({ page = 1, limit = 10 } = {}) => {
    const requestId = ++equipmentListRequestId;
    set({ isLoading: true, error: null });
    try {
      const result = await equipmentApi.listEquipment({ page, limit });
      if (requestId !== equipmentListRequestId) return;
      set({
        equipment: result.data,
        pagination: result.meta,
        total: result.meta.total,
        isLoading: false,
      });
    } catch (err) {
      if (requestId !== equipmentListRequestId) return;
      const message =
        err instanceof ApiError ? err.message : 'Failed to load equipment';
      set({ isLoading: false, error: message });
    }
  },

  createEquipment: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const created = await equipmentApi.createEquipment(data);
      const { pagination } = get();
      await get().fetchEquipment({ page: 1, limit: pagination?.limit ?? 10 });
      set({ isSaving: false });
      return created;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to create equipment';
      set({ isSaving: false, error: message });
      throw err;
    }
  },

  updateEquipment: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await equipmentApi.updateEquipment(id, data);
      set((state) => ({
        equipment: state.equipment.map((item) =>
          item.id === id
            ? {
                ...item,
                name: updated.name,
                category: updated.category,
                quantity: updated.quantity,
              }
            : item,
        ),
        isSaving: false,
      }));
      return updated;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to update equipment';
      set({ isSaving: false, error: message });
      throw err;
    }
  },

  deleteEquipment: async (id, currentPage = 1) => {
    set({ isSaving: true, error: null });
    try {
      await equipmentApi.deleteEquipment(id);
      const { pagination } = get();
      const limit = pagination?.limit ?? 10;
      const total = (pagination?.total ?? 1) - 1;
      const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
      const pageToFetch =
        currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;
      await get().fetchEquipment({ page: pageToFetch, limit });
      set({ isSaving: false });
      return pageToFetch;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to delete equipment';
      set({ isSaving: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
