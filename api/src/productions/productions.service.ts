import { Injectable, NotFoundException } from '@nestjs/common';
import { Production } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { ReplaceRunSheetDto } from './dto/replace-run-sheet.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import {
  ProductionDetail,
  ProductionSummary,
  toProductionDetail,
  toProductionSummary,
} from './productions.types';

@Injectable()
export class ProductionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<ProductionSummary[]> {
    const productions = await this.prisma.production.findMany({
      where: { userId },
      include: {
        _count: { select: { runSheetItems: true } },
        runSheetItems: { select: { durationMinutes: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return productions.map(toProductionSummary);
  }

  async findOne(userId: string, id: string): Promise<ProductionDetail> {
    const production = await this.prisma.production.findFirst({
      where: { id, userId },
      include: {
        runSheetItems: { orderBy: { sequence: 'asc' } },
      },
    });

    if (!production) {
      throw new NotFoundException('Production not found');
    }

    return toProductionDetail(production);
  }

  async create(userId: string, dto: CreateProductionDto): Promise<ProductionDetail> {
    const production = await this.prisma.$transaction(async (tx) => {
      return tx.production.create({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
          runSheetItems: {
            create: dto.runSheetItems.map((item, index) => ({
              sequence: index + 1,
              title: item.title,
              durationMinutes: item.durationMinutes,
              notes: item.notes,
            })),
          },
        },
        include: {
          runSheetItems: { orderBy: { sequence: 'asc' } },
        },
      });
    });

    return toProductionDetail(production);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProductionDto,
  ): Promise<ProductionDetail> {
    await this.findOwnedOrThrow(userId, id);

    const production = await this.prisma.production.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.eventDate !== undefined && {
          eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: {
        runSheetItems: { orderBy: { sequence: 'asc' } },
      },
    });

    return toProductionDetail(production);
  }

  async replaceRunSheet(
    userId: string,
    id: string,
    dto: ReplaceRunSheetDto,
  ): Promise<ProductionDetail> {
    await this.findOwnedOrThrow(userId, id);

    const production = await this.prisma.$transaction(async (tx) => {
      await tx.runSheetItem.deleteMany({ where: { productionId: id } });

      await tx.runSheetItem.createMany({
        data: dto.items.map((item, index) => ({
          productionId: id,
          sequence: index + 1,
          title: item.title,
          durationMinutes: item.durationMinutes,
          notes: item.notes,
        })),
      });

      return tx.production.findUniqueOrThrow({
        where: { id },
        include: {
          runSheetItems: { orderBy: { sequence: 'asc' } },
        },
      });
    });

    return toProductionDetail(production);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.findOwnedOrThrow(userId, id);
    await this.prisma.production.delete({ where: { id } });
    return { ok: true };
  }

  private async findOwnedOrThrow(userId: string, id: string): Promise<Production> {
    const production = await this.prisma.production.findFirst({
      where: { id, userId },
    });

    if (!production) {
      throw new NotFoundException('Production not found');
    }

    return production;
  }
}
