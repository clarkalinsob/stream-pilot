import { CrewRole, ProductionStatus } from '@prisma/client';
import { ProductionSummary } from '../productions/productions.types';

export type ProductionStatusCounts = Record<ProductionStatus, number>;

export type TopCrewMember = {
  id: string;
  name: string;
  role: CrewRole;
  assignmentCount: number;
};

export type DashboardStats = {
  productions: {
    total: number;
    byStatus: ProductionStatusCounts;
  };
  crew: {
    total: number;
    unassigned: number;
    topBooked: TopCrewMember[];
  };
  equipment: {
    total: number;
    unassigned: number;
  };
  runSheet: {
    totalSegments: number;
    totalDurationMinutes: number;
  };
  upcomingProductions: ProductionSummary[];
};

export const EMPTY_STATUS_COUNTS: ProductionStatusCounts = {
  DRAFT: 0,
  SCHEDULED: 0,
  COMPLETED: 0,
};
