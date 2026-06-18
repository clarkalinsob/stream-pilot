import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EquipmentService } from './equipment.service';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let prisma: {
    equipment: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const userId = 'user-1';
  const equipmentId = 'equip-1';

  const baseItem = {
    id: equipmentId,
    userId,
    name: 'Main Camera',
    category: EquipmentCategory.CAMERA,
    quantity: 2,
    notes: null,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    _count: { assignments: 0 },
  };

  beforeEach(async () => {
    prisma = {
      equipment: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EquipmentService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(EquipmentService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated equipment with default page and limit', async () => {
      prisma.equipment.findMany.mockResolvedValue([baseItem]);
      prisma.equipment.count.mockResolvedValue(12);

      const result = await service.findAll(userId, {});

      expect(prisma.equipment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 12,
        totalPages: 2,
      });
      expect(result.data[0].name).toBe('Main Camera');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when equipment is missing', async () => {
      prisma.equipment.findFirst.mockResolvedValue(null);

      await expect(service.findOne(userId, equipmentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when equipment is not owned', async () => {
      prisma.equipment.findFirst.mockResolvedValue(null);

      await expect(
        service.update(userId, equipmentId, { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when equipment is not owned', async () => {
      prisma.equipment.findFirst.mockResolvedValue(null);

      await expect(service.remove(userId, equipmentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes equipment when owned', async () => {
      prisma.equipment.findFirst.mockResolvedValue(baseItem);
      prisma.equipment.delete.mockResolvedValue(baseItem);

      const result = await service.remove(userId, equipmentId);

      expect(prisma.equipment.delete).toHaveBeenCalledWith({
        where: { id: equipmentId },
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
