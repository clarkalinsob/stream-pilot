import { create } from 'zustand';
import * as equipmentApi from '@/lib/equipment';
import { ApiError } from '@/lib/api';
import { listQueryKey, resolveListQuery, type ListQueryParams } from '@/lib/list-query';
import { singleFlight } from '@/lib/single-flight';
import type {
  CreateEquipmentData,
  EquipmentDetail,
  EquipmentSummary,
  UpdateEquipmentData,
} from '@/types/equipment';
import type { PaginationMeta } from '@/types/production';

type FetchEquipmentParams = ListQueryParams;

type EquipmentState = {
  equipment: EquipmentSummary[];
  pagination: PaginationMeta | null;
  total: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchEquipment: (
    params?: FetchEquipmentParams,
    options?: { force?: boolean },
  ) => Promise<void>;
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
let lastEquipmentFetchParams: FetchEquipmentParams = { page: 1, limit: 10 };
let lastSuccessfulEquipmentQueryKey: string | null = null;

export const useEquipmentStore = create<EquipmentState>((set, get) => {
  const createEquipment = singleFlight(async (data: CreateEquipmentData) => {
    set({ isSaving: true, error: null });
    try {
      const created = await equipmentApi.createEquipment(data);
      const { pagination } = get();
      await Promise.all([
        get().fetchEquipment({ page: 1, limit: pagination?.limit ?? 10 }, { force: true }),
        get().fetchEquipmentTotal(),
      ]);
      set({ isSaving: false });
      return created;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to create equipment';
      set({ isSaving: false, error: message });
      throw err;
    }
  });

  const updateEquipment = singleFlight(
    async (id: string, data: UpdateEquipmentData) => {
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
  );

  const deleteEquipment = singleFlight(
    async (id: string, currentPage = 1) => {
      set({ isSaving: true, error: null });
      try {
        await equipmentApi.deleteEquipment(id);
        const { pagination } = get();
        const limit = pagination?.limit ?? 10;
        const total = (pagination?.total ?? 1) - 1;
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
        const pageToFetch =
          currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;
        await get().fetchEquipment(
          { ...lastEquipmentFetchParams, page: pageToFetch },
          { force: true },
        );
        await get().fetchEquipmentTotal();
        set({ isSaving: false });
        return pageToFetch;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to delete equipment';
        set({ isSaving: false, error: message });
        throw err;
      }
    },
  );

  return {
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

  fetchEquipment: async (params = {}, options = {}) => {
    const requestId = ++equipmentListRequestId;
    const query = resolveListQuery(params, lastEquipmentFetchParams);
    const key = listQueryKey(query);
    lastEquipmentFetchParams = query;

    if (
      !options.force &&
      key === lastSuccessfulEquipmentQueryKey &&
      get().pagination !== null
    ) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await equipmentApi.listEquipment(query);
      if (requestId !== equipmentListRequestId) return;
      lastSuccessfulEquipmentQueryKey = key;
      set({
        equipment: result.data,
        pagination: result.meta,
        isLoading: false,
      });
    } catch (err) {
      if (requestId !== equipmentListRequestId) return;
      const message =
        err instanceof ApiError ? err.message : 'Failed to load equipment';
      set({ isLoading: false, error: message });
    }
  },

  createEquipment,
  updateEquipment,
  deleteEquipment,

  clearError: () => set({ error: null }),
  };
});
