export type ProductionStatus = 'DRAFT' | 'SCHEDULED' | 'COMPLETED';

export type RunSheetItem = {
  id?: string;
  title: string;
  durationMinutes?: number;
  notes?: string;
};

export type ProductionSummary = {
  id: string;
  title: string;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  status: ProductionStatus;
  segmentCount: number;
  totalDurationMinutes: number;
};

export type ProductionDetail = ProductionSummary & {
  description: string | null;
  runSheetItems: RunSheetItemResponse[];
  createdAt: string;
  updatedAt: string;
};

export type RunSheetItemResponse = {
  id: string;
  sequence: number;
  title: string;
  durationMinutes: number | null;
  notes: string | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedProductions = {
  data: ProductionSummary[];
  meta: PaginationMeta;
};

export type CreateProductionData = {
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  runSheetItems: RunSheetItem[];
};

export type UpdateProductionData = {
  title?: string;
  description?: string | null;
  eventDate?: string | null;
  startTime?: string | null;
  status?: ProductionStatus;
};
