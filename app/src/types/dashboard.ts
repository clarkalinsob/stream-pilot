import type { CrewRole } from '@/types/crew';
import type { ProductionStatus, ProductionSummary } from '@/types/production';

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
