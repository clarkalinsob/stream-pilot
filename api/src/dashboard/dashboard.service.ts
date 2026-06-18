import { Injectable } from '@nestjs/common';
import { ProductionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toProductionSummary } from '../productions/productions.types';
import {
  DashboardStats,
  EMPTY_STATUS_COUNTS,
  ProductionStatusCounts,
} from './dashboard.types';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      statusGroups,
      crewTotal,
      equipmentTotal,
      unassignedCrew,
      unassignedEquipment,
      topCrew,
      topEquipment,
      upcomingProductions,
      runSheetAgg,
    ] = await Promise.all([
      this.prisma.production.groupBy({
        by: ['status'],
        where: { userId },
        _count: { _all: true },
      }),
      this.prisma.crewMember.count({ where: { userId } }),
      this.prisma.equipment.count({ where: { userId } }),
      this.prisma.crewMember.count({
        where: { userId, assignments: { none: {} } },
      }),
      this.prisma.equipment.count({
        where: { userId, assignments: { none: {} } },
      }),
      this.prisma.crewMember.findMany({
        where: { userId },
        include: { _count: { select: { assignments: true } } },
        orderBy: { assignments: { _count: 'desc' } },
        take: 3,
      }),
      this.prisma.equipment.findMany({
        where: { userId },
        include: { _count: { select: { assignments: true } } },
        orderBy: { assignments: { _count: 'desc' } },
        take: 3,
      }),
      this.prisma.production.findMany({
        where: {
          userId,
          status: { not: ProductionStatus.COMPLETED },
          eventDate: { gte: today },
        },
        include: {
          _count: { select: { runSheetItems: true } },
          runSheetItems: { select: { durationMinutes: true } },
        },
        orderBy: [
          { eventDate: { sort: 'asc', nulls: 'last' } },
          { startTime: { sort: 'asc', nulls: 'last' } },
        ],
        take: 4,
      }),
      this.prisma.runSheetItem.aggregate({
        where: { production: { userId } },
        _sum: { durationMinutes: true },
        _count: true,
      }),
    ]);

    const byStatus = toStatusCounts(statusGroups);
    const totalProductions =
      byStatus.DRAFT + byStatus.SCHEDULED + byStatus.COMPLETED;

    return {
      productions: {
        total: totalProductions,
        byStatus,
      },
      crew: {
        total: crewTotal,
        unassigned: unassignedCrew,
        topBooked: topCrew.map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role,
          assignmentCount: member._count.assignments,
        })),
      },
      equipment: {
        total: equipmentTotal,
        unassigned: unassignedEquipment,
        topBooked: topEquipment.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          assignmentCount: item._count.assignments,
        })),
      },
      runSheet: {
        totalSegments: runSheetAgg._count,
        totalDurationMinutes: runSheetAgg._sum.durationMinutes ?? 0,
      },
      upcomingProductions: upcomingProductions.map(toProductionSummary),
    };
  }
}

function toStatusCounts(
  groups: { status: ProductionStatus; _count: { _all: number } }[],
): ProductionStatusCounts {
  const counts = { ...EMPTY_STATUS_COUNTS };
  for (const group of groups) {
    counts[group.status] = group._count._all;
  }
  return counts;
}
