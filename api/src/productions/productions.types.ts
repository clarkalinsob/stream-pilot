import {
  CrewRole,
  EquipmentCategory,
  Production,
  ProductionStatus,
  RunSheetItem,
} from '@prisma/client';
import { toDateString, toTimeString } from './event-schedule';

export type RunSheetItemResponse = {
  id: string;
  sequence: number;
  title: string;
  durationMinutes: number | null;
  notes: string | null;
};

export type CrewAssignmentResponse = {
  crewMemberId: string;
  name: string;
  role: CrewRole;
  email: string | null;
  phone: string | null;
};

export type EquipmentAssignmentResponse = {
  equipmentId: string;
  name: string;
  category: EquipmentCategory;
  quantity: number;
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
  crewAssignments: CrewAssignmentResponse[];
  equipmentAssignments: EquipmentAssignmentResponse[];
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedProductionsResponse = {
  data: ProductionSummary[];
  meta: PaginationMeta;
};

type ProductionWithItems = Production & {
  runSheetItems: RunSheetItem[];
  crewAssignments: {
    crewMember: {
      id: string;
      name: string;
      role: CrewRole;
      email: string | null;
      phone: string | null;
    };
  }[];
  equipmentAssignments: {
    quantity: number;
    equipment: {
      id: string;
      name: string;
      category: EquipmentCategory;
    };
  }[];
};

type ProductionWithCount = Production & {
  _count: { runSheetItems: number };
  runSheetItems: { durationMinutes: number | null }[];
};

export const productionDetailInclude = {
  runSheetItems: { orderBy: { sequence: 'asc' as const } },
  crewAssignments: {
    include: {
      crewMember: {
        select: { id: true, name: true, role: true, email: true, phone: true },
      },
    },
  },
  equipmentAssignments: {
    include: {
      equipment: {
        select: { id: true, name: true, category: true },
      },
    },
  },
};

export function toRunSheetItemResponse(item: RunSheetItem): RunSheetItemResponse {
  return {
    id: item.id,
    sequence: item.sequence,
    title: item.title,
    durationMinutes: item.durationMinutes,
    notes: item.notes,
  };
}

function sumDurationMinutes(items: { durationMinutes: number | null }[]): number {
  return items.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
}

function toScheduleFields(production: Production) {
  return {
    eventDate: toDateString(production.eventDate),
    startTime: toTimeString(production.startTime),
    endTime: toTimeString(production.endTime),
  };
}

function toCrewAssignments(
  assignments: ProductionWithItems['crewAssignments'],
): CrewAssignmentResponse[] {
  return assignments.map((assignment) => ({
    crewMemberId: assignment.crewMember.id,
    name: assignment.crewMember.name,
    role: assignment.crewMember.role,
    email: assignment.crewMember.email,
    phone: assignment.crewMember.phone,
  }));
}

function toEquipmentAssignments(
  assignments: ProductionWithItems['equipmentAssignments'],
): EquipmentAssignmentResponse[] {
  return assignments.map((assignment) => ({
    equipmentId: assignment.equipment.id,
    name: assignment.equipment.name,
    category: assignment.equipment.category,
    quantity: assignment.quantity,
  }));
}

export function toProductionSummary(production: ProductionWithCount): ProductionSummary {
  return {
    id: production.id,
    title: production.title,
    ...toScheduleFields(production),
    status: production.status,
    segmentCount: production._count.runSheetItems,
    totalDurationMinutes: sumDurationMinutes(production.runSheetItems),
  };
}

export function toProductionDetail(production: ProductionWithItems): ProductionDetail {
  const items = production.runSheetItems.map(toRunSheetItemResponse);

  return {
    id: production.id,
    title: production.title,
    description: production.description,
    ...toScheduleFields(production),
    status: production.status,
    segmentCount: items.length,
    totalDurationMinutes: sumDurationMinutes(production.runSheetItems),
    runSheetItems: items,
    crewAssignments: toCrewAssignments(production.crewAssignments),
    equipmentAssignments: toEquipmentAssignments(production.equipmentAssignments),
    createdAt: production.createdAt.toISOString(),
    updatedAt: production.updatedAt.toISOString(),
  };
}
