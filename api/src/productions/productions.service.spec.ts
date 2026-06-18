import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductionsService } from './productions.service';

describe('ProductionsService', () => {
  let service: ProductionsService;
  let prisma: {
    production: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const userId = 'user-1';
  const productionId = 'prod-1';

  const baseProduction = {
    id: productionId,
    userId,
    title: 'Morning Show',
    description: null,
    eventDate: new Date('2026-06-20T00:00:00.000Z'),
    startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
    endTime: new Date(Date.UTC(1970, 0, 1, 9, 30)),
    status: ProductionStatus.DRAFT,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    runSheetItems: [
      {
        id: 'item-1',
        productionId,
        sequence: 1,
        title: 'Intro',
        durationMinutes: 60,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'item-2',
        productionId,
        sequence: 2,
        title: 'Segment',
        durationMinutes: 30,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    crewAssignments: [],
    equipmentAssignments: [],
  };

  beforeEach(async () => {
    prisma = {
      production: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProductionsService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('returns production detail when owned by user', async () => {
      prisma.production.findFirst.mockResolvedValue(baseProduction);

      const result = await service.findOne(userId, productionId);

      expect(result.id).toBe(productionId);
      expect(result.title).toBe('Morning Show');
      expect(result.totalDurationMinutes).toBe(90);
      expect(result.runSheetItems).toHaveLength(2);
    });

    it('throws NotFoundException when production is missing', async () => {
      prisma.production.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, productionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns paginated productions with meta', async () => {
      prisma.production.findMany.mockResolvedValue([
        {
          ...baseProduction,
          _count: { runSheetItems: 2 },
          runSheetItems: [{ durationMinutes: 60 }, { durationMinutes: 30 }],
        },
      ]);
      prisma.production.count.mockResolvedValue(25);

      const result = await service.findAll(userId, { page: 2, limit: 10 });

      expect(prisma.production.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].segmentCount).toBe(2);
    });
  });

  describe('create', () => {
    it('computes end time from start time and segment durations', async () => {
      const createMock = jest.fn().mockResolvedValue(baseProduction);
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          production: { create: createMock },
        }),
      );

      const result = await service.create(userId, {
        title: 'Morning Show',
        eventDate: '2026-06-20',
        startTime: '08:00',
        runSheetItems: [
          { title: 'Intro', durationMinutes: 60 },
          { title: 'Segment', durationMinutes: 30 },
        ],
      });

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            title: 'Morning Show',
            endTime: expect.any(Date),
            runSheetItems: {
              create: [
                expect.objectContaining({ sequence: 1, title: 'Intro' }),
                expect.objectContaining({ sequence: 2, title: 'Segment' }),
              ],
            },
          }),
        }),
      );
      expect(result.endTime).toBe('09:30');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when production is not owned', async () => {
      prisma.production.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, productionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes production when owned', async () => {
      prisma.production.findFirst.mockResolvedValue(baseProduction);
      prisma.production.delete.mockResolvedValue(baseProduction);

      const result = await service.remove(userId, productionId);

      expect(prisma.production.delete).toHaveBeenCalledWith({
        where: { id: productionId },
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
