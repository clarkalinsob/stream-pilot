import { Test, TestingModule } from '@nestjs/testing';
import { CrewRole, ProductionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    production: {
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
    crewMember: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    equipment: {
      count: jest.Mock;
    };
    runSheetItem: {
      aggregate: jest.Mock;
    };
  };

  const userId = 'user-1';

  beforeEach(async () => {
    prisma = {
      production: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      crewMember: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      equipment: {
        count: jest.fn(),
      },
      runSheetItem: {
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  it('aggregates dashboard stats for the user', async () => {
    prisma.production.groupBy.mockResolvedValue([
      { status: ProductionStatus.DRAFT, _count: { _all: 2 } },
      { status: ProductionStatus.SCHEDULED, _count: { _all: 3 } },
      { status: ProductionStatus.COMPLETED, _count: { _all: 1 } },
    ]);
    prisma.crewMember.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    prisma.equipment.count.mockResolvedValueOnce(8).mockResolvedValueOnce(3);
    prisma.crewMember.findMany.mockResolvedValue([
      {
        id: 'crew-1',
        name: 'Alex Rivera',
        role: CrewRole.CAMERAMAN,
        _count: { assignments: 4 },
      },
    ]);
    prisma.production.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        title: 'Morning Show',
        eventDate: new Date('2026-06-20'),
        startTime: new Date('1970-01-01T09:00:00.000Z'),
        endTime: new Date('1970-01-01T10:30:00.000Z'),
        status: ProductionStatus.SCHEDULED,
        _count: { runSheetItems: 2 },
        runSheetItems: [{ durationMinutes: 45 }, { durationMinutes: 45 }],
      },
    ]);
    prisma.runSheetItem.aggregate.mockResolvedValue({
      _sum: { durationMinutes: 180 },
      _count: 6,
    });

    const result = await service.getStats(userId);

    expect(prisma.production.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId } }),
    );
    expect(prisma.production.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId,
          status: { not: ProductionStatus.COMPLETED },
        }),
        take: 5,
      }),
    );
    expect(result.productions.total).toBe(6);
    expect(result.productions.byStatus).toEqual({
      DRAFT: 2,
      SCHEDULED: 3,
      COMPLETED: 1,
    });
    expect(result.crew).toEqual({
      total: 5,
      unassigned: 2,
      topBooked: [
        {
          id: 'crew-1',
          name: 'Alex Rivera',
          role: CrewRole.CAMERAMAN,
          assignmentCount: 4,
        },
      ],
    });
    expect(result.equipment).toEqual({ total: 8, unassigned: 3 });
    expect(result.runSheet).toEqual({
      totalSegments: 6,
      totalDurationMinutes: 180,
    });
    expect(result.upcomingProductions).toHaveLength(1);
    expect(result.upcomingProductions[0].title).toBe('Morning Show');
    expect(result.upcomingProductions[0].segmentCount).toBe(2);
    expect(result.upcomingProductions[0].totalDurationMinutes).toBe(90);
  });

  it('returns zero counts when user has no data', async () => {
    prisma.production.groupBy.mockResolvedValue([]);
    prisma.crewMember.count.mockResolvedValue(0);
    prisma.equipment.count.mockResolvedValue(0);
    prisma.crewMember.findMany.mockResolvedValue([]);
    prisma.production.findMany.mockResolvedValue([]);
    prisma.runSheetItem.aggregate.mockResolvedValue({
      _sum: { durationMinutes: null },
      _count: 0,
    });

    const result = await service.getStats(userId);

    expect(result.productions.total).toBe(0);
    expect(result.productions.byStatus).toEqual({
      DRAFT: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
    });
    expect(result.runSheet.totalDurationMinutes).toBe(0);
    expect(result.upcomingProductions).toEqual([]);
  });
});
