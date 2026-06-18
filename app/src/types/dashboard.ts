import type { CrewRole } from '@/types/crew';
import type { EquipmentCategory } from '@/types/equipment';
import type { ProductionStatus, ProductionSummary } from '@/types/production';

export type ProductionStatusCounts = Record<ProductionStatus, number>;

export type TopCrewMember = {
  id: string;
  name: string;
  role: CrewRole;
  assignmentCount: number;
};

export type TopEquipment = {
  id: string;
  name: string;
  category: EquipmentCategory;
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
    topBooked: TopEquipment[];
  };
  runSheet: {
    totalSegments: number;
    totalDurationMinutes: number;
  };
  upcomingProductions: ProductionSummary[];
};
