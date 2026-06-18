import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CrewRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrewService } from './crew.service';

describe('CrewService', () => {
  let service: CrewService;
  let prisma: {
    crewMember: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const userId = 'user-1';
  const memberId = 'crew-1';

  const baseMember = {
    id: memberId,
    userId,
    name: 'Alex Rivera',
    role: CrewRole.CAMERAMAN,
    email: 'alex@example.com',
    phone: null,
    notes: null,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    _count: { assignments: 0 },
  };

  beforeEach(async () => {
    prisma = {
      crewMember: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CrewService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CrewService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated crew with default page and limit', async () => {
      prisma.crewMember.findMany.mockResolvedValue([baseMember]);
      prisma.crewMember.count.mockResolvedValue(15);

      const result = await service.findAll(userId, {});

      expect(prisma.crewMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: [{ name: 'asc' }, { updatedAt: 'desc' }],
        }),
      );
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
      });
      expect(result.data[0].name).toBe('Alex Rivera');
    });

    it('sorts crew by an allowed field', async () => {
      prisma.crewMember.findMany.mockResolvedValue([baseMember]);
      prisma.crewMember.count.mockResolvedValue(1);

      await service.findAll(userId, { sort: 'role', order: 'desc' });

      expect(prisma.crewMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ role: 'desc' }],
        }),
      );
    });

    it('filters crew by search term', async () => {
      prisma.crewMember.findMany.mockResolvedValue([baseMember]);
      prisma.crewMember.count.mockResolvedValue(1);

      await service.findAll(userId, { search: 'alex' });

      expect(prisma.crewMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            OR: [
              { name: { contains: 'alex', mode: 'insensitive' } },
              { email: { contains: 'alex', mode: 'insensitive' } },
              { phone: { contains: 'alex', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when crew member is missing', async () => {
      prisma.crewMember.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, memberId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when crew member is not owned', async () => {
      prisma.crewMember.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, memberId, { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when crew member is not owned', async () => {
      prisma.crewMember.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, memberId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes crew member when owned', async () => {
      prisma.crewMember.findFirst.mockResolvedValue(baseMember);
      prisma.crewMember.delete.mockResolvedValue(baseMember);

      const result = await service.remove(userId, memberId);

      expect(prisma.crewMember.delete).toHaveBeenCalledWith({
        where: { id: memberId },
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
