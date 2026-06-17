import { Injectable, NotFoundException } from '@nestjs/common';
import { Equipment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { ListEquipmentQueryDto } from './dto/list-equipment-query.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import {
  EquipmentDetail,
  PaginatedEquipmentResponse,
  toEquipmentDetail,
  toEquipmentSummary,
} from './equipment.types';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    query: ListEquipmentQueryDto,
  ): Promise<PaginatedEquipmentResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = { userId };

    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { assignments: true } } },
        orderBy: [{ name: 'asc' }, { updatedAt: 'desc' }],
      }),
      this.prisma.equipment.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: items.map(toEquipmentSummary),
      meta: { page, limit, total, totalPages },
    };
  }

  async findOne(userId: string, id: string): Promise<EquipmentDetail> {
    const item = await this.prisma.equipment.findFirst({
      where: { id, userId },
      include: { _count: { select: { assignments: true } } },
    });

    if (!item) {
      throw new NotFoundException('Equipment not found');
    }

    return toEquipmentDetail(item);
  }

  async create(userId: string, dto: CreateEquipmentDto): Promise<EquipmentDetail> {
    const item = await this.prisma.equipment.create({
      data: {
        userId,
        name: dto.name,
        category: dto.category,
        quantity: dto.quantity ?? 1,
        notes: dto.notes,
      },
      include: { _count: { select: { assignments: true } } },
    });

    return toEquipmentDetail(item);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateEquipmentDto,
  ): Promise<EquipmentDetail> {
    await this.findOwnedOrThrow(userId, id);

    const item = await this.prisma.equipment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: { _count: { select: { assignments: true } } },
    });

    return toEquipmentDetail(item);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.findOwnedOrThrow(userId, id);
    await this.prisma.equipment.delete({ where: { id } });
    return { ok: true };
  }

  private async findOwnedOrThrow(userId: string, id: string): Promise<Equipment> {
    const item = await this.prisma.equipment.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException('Equipment not found');
    }

    return item;
  }
}
