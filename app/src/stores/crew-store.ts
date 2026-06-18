import { create } from 'zustand';
import * as crewApi from '@/lib/crew';
import { ApiError } from '@/lib/api';
import { listQueryKey, resolveListQuery, type ListQueryParams } from '@/lib/list-query';
import { singleFlight } from '@/lib/single-flight';
import type {
  CreateCrewMemberData,
  CrewMemberDetail,
  CrewMemberSummary,
  UpdateCrewMemberData,
} from '@/types/crew';
import type { PaginationMeta } from '@/types/production';

type FetchCrewParams = ListQueryParams;

type CrewState = {
  crew: CrewMemberSummary[];
  pagination: PaginationMeta | null;
  total: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchCrew: (params?: FetchCrewParams, options?: { force?: boolean }) => Promise<void>;
  fetchCrewTotal: () => Promise<void>;
  createCrewMember: (data: CreateCrewMemberData) => Promise<CrewMemberDetail>;
  updateCrewMember: (
    id: string,
    data: UpdateCrewMemberData,
  ) => Promise<CrewMemberDetail>;
  deleteCrewMember: (id: string, currentPage?: number) => Promise<number>;
  clearError: () => void;
};

let crewListRequestId = 0;
let lastCrewFetchParams: FetchCrewParams = { page: 1, limit: 10 };
let lastSuccessfulCrewQueryKey: string | null = null;

export const useCrewStore = create<CrewState>((set, get) => {
  const createCrewMember = singleFlight(async (data: CreateCrewMemberData) => {
    set({ isSaving: true, error: null });
    try {
      const created = await crewApi.createCrewMember(data);
      const { pagination } = get();
      await Promise.all([
        get().fetchCrew({ page: 1, limit: pagination?.limit ?? 10 }, { force: true }),
        get().fetchCrewTotal(),
      ]);
      set({ isSaving: false });
      return created;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to create crew member';
      set({ isSaving: false, error: message });
      throw err;
    }
  });

  const updateCrewMember = singleFlight(
    async (id: string, data: UpdateCrewMemberData) => {
      set({ isSaving: true, error: null });
      try {
        const updated = await crewApi.updateCrewMember(id, data);
        set((state) => ({
          crew: state.crew.map((m) =>
            m.id === id
              ? {
                  ...m,
                  name: updated.name,
                  role: updated.role,
                  email: updated.email,
                  phone: updated.phone,
                }
              : m,
          ),
          isSaving: false,
        }));
        return updated;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to update crew member';
        set({ isSaving: false, error: message });
        throw err;
      }
    },
  );

  const deleteCrewMember = singleFlight(
    async (id: string, currentPage = 1) => {
      set({ isSaving: true, error: null });
      try {
        await crewApi.deleteCrewMember(id);
        const { pagination } = get();
        const limit = pagination?.limit ?? 10;
        const total = (pagination?.total ?? 1) - 1;
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
        const pageToFetch =
          currentPage > totalPages && totalPages > 0 ? totalPages : currentPage;
        await get().fetchCrew({ ...lastCrewFetchParams, page: pageToFetch }, { force: true });
        await get().fetchCrewTotal();
        set({ isSaving: false });
        return pageToFetch;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to delete crew member';
        set({ isSaving: false, error: message });
        throw err;
      }
    },
  );

  return {
  crew: [],
  pagination: null,
  total: 0,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchCrewTotal: async () => {
    try {
      const result = await crewApi.listCrew({ page: 1, limit: 1 });
      set({ total: result.meta.total });
    } catch {
      // Tab counts are non-critical; list fetch will refresh total.
    }
  },

  fetchCrew: async (params = {}, options = {}) => {
    const requestId = ++crewListRequestId;
    const query = resolveListQuery(params, lastCrewFetchParams);
    const key = listQueryKey(query);
    lastCrewFetchParams = query;

    if (
      !options.force &&
      key === lastSuccessfulCrewQueryKey &&
      get().pagination !== null
    ) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await crewApi.listCrew(query);
      if (requestId !== crewListRequestId) return;
      lastSuccessfulCrewQueryKey = key;
      set({
        crew: result.data,
        pagination: result.meta,
        isLoading: false,
      });
    } catch (err) {
      if (requestId !== crewListRequestId) return;
      const message =
        err instanceof ApiError ? err.message : 'Failed to load crew';
      set({ isLoading: false, error: message });
    }
  },

  createCrewMember,
  updateCrewMember,
  deleteCrewMember,

  clearError: () => set({ error: null }),
  };
});
