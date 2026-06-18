import { create } from 'zustand';
import * as productionsApi from '@/lib/productions';
import { ApiError } from '@/lib/api';
import { singleFlight } from '@/lib/single-flight';
import type {
  CreateProductionData,
  PaginationMeta,
  ProductionDetail,
  ProductionSummary,
  ReplaceAssignmentsData,
  RunSheetItem,
  UpdateProductionData,
} from '@/types/production';

type FetchProductionsParams = {
  page?: number;
  limit?: number;
};

type ProductionsState = {
  productions: ProductionSummary[];
  pagination: PaginationMeta | null;
  current: ProductionDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchProductions: (params?: FetchProductionsParams) => Promise<void>;
  fetchProduction: (id: string) => Promise<void>;
  createProduction: (data: CreateProductionData) => Promise<ProductionDetail>;
  updateProduction: (
    id: string,
    data: UpdateProductionData,
  ) => Promise<ProductionDetail>;
  replaceRunSheet: (
    id: string,
    items: RunSheetItem[],
  ) => Promise<ProductionDetail>;
  replaceAssignments: (
    id: string,
    data: ReplaceAssignmentsData,
  ) => Promise<ProductionDetail>;
  deleteProduction: (id: string, currentPage?: number) => Promise<number>;
  clearError: () => void;
  clearCurrent: () => void;
};

export const useProductionsStore = create<ProductionsState>((set, get) => {
  const createProduction = singleFlight(async (data: CreateProductionData) => {
    set({ isSaving: true, error: null });
    try {
      const created = await productionsApi.createProduction(data);
      set({ isSaving: false, current: created });
      return created;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to create production';
      set({ isSaving: false, error: message });
      throw err;
    }
  });

  const updateProduction = singleFlight(
    async (id: string, data: UpdateProductionData) => {
      set({ isSaving: true, error: null });
      try {
        const updated = await productionsApi.updateProduction(id, data);
        set((state) => ({
          isSaving: false,
          current: state.current?.id === id ? updated : state.current,
          productions: state.productions.map((production) =>
            production.id === id
              ? {
                  id: updated.id,
                  title: updated.title,
                  eventDate: updated.eventDate,
                  startTime: updated.startTime,
                  endTime: updated.endTime,
                  status: updated.status,
                  segmentCount: updated.segmentCount,
                  totalDurationMinutes: updated.totalDurationMinutes,
                }
              : production,
          ),
        }));
        return updated;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to update production';
        set({ isSaving: false, error: message });
        throw err;
      }
    },
  );

  const replaceRunSheet = singleFlight(
    async (id: string, items: RunSheetItem[]) => {
      set({ isSaving: true, error: null });
      try {
        const updated = await productionsApi.replaceRunSheet(id, items);
        set({ isSaving: false, current: updated });
        return updated;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to save run sheet';
        set({ isSaving: false, error: message });
        throw err;
      }
    },
  );

  const replaceAssignments = singleFlight(
    async (id: string, data: ReplaceAssignmentsData) => {
      set({ isSaving: true, error: null });
      try {
        const updated = await productionsApi.replaceAssignments(id, data);
        set({ isSaving: false, current: updated });
        return updated;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Failed to save assignments';
        set({ isSaving: false, error: message });
        throw err;
      }
    },
  );

  const deleteProduction = singleFlight(
    async (id: string, currentPage = 1) => {
      set({ isSaving: true, error: null });
      try {
        await productionsApi.deleteProduction(id);
        const { pagination } = get();
        const limit = pagination?.limit ?? 10;
        const total = (pagination?.total ?? 1) - 1;
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
        const pageToFetch =
          currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;
        await get().fetchProductions({ page: pageToFetch, limit });
        set({ isSaving: false, current: null });
        return pageToFetch;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to delete production';
        set({ isSaving: false, error: message });
        throw err;
      }
    },
  );

  return {
  productions: [],
  pagination: null,
  current: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProductions: async ({ page = 1, limit = 10 } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await productionsApi.listProductions({ page, limit });
      set({
        productions: result.data,
        pagination: result.meta,
        isLoading: false,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load productions';
      set({ isLoading: false, error: message });
    }
  },

  fetchProduction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const current = await productionsApi.getProduction(id);
      set({ current, isLoading: false });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load production';
      set({ isLoading: false, error: message, current: null });
    }
  },

  createProduction,
  updateProduction,
  replaceRunSheet,
  replaceAssignments,
  deleteProduction,

  clearError: () => set({ error: null }),

  clearCurrent: () => set({ current: null }),
  };
});
