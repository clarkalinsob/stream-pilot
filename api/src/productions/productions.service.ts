import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma, Production, ProductionStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { ListProductionsQueryDto } from './dto/list-productions-query.dto';
import { ReplaceAssignmentsDto } from './dto/replace-assignments.dto';
import { ReplaceRunSheetDto } from './dto/replace-run-sheet.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import {
  computeEndTimeDate,
  parseDateString,
  parseTimeString,
  sumDurationMinutes,
  formatTimeUntilEvent,
  toTimeString,
} from './event-schedule';
import {
  PaginatedProductionsResponse,
  ProductionDetail,
  productionDetailInclude,
  toProductionDetail,
  toProductionSummary,
} from './productions.types';

type PrismaTx = Prisma.TransactionClient;

@Injectable()
export class ProductionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(
    userId: string,
    query: ListProductionsQueryDto,
  ): Promise<PaginatedProductionsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [productions, total] = await Promise.all([
      this.prisma.production.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { runSheetItems: true } },
          runSheetItems: { select: { durationMinutes: true } },
        },
        orderBy: [
          { eventDate: { sort: 'desc', nulls: 'last' } },
          { startTime: { sort: 'desc', nulls: 'last' } },
          { updatedAt: 'desc' },
        ],
      }),
      this.prisma.production.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: productions.map(toProductionSummary),
      meta: { page, limit, total, totalPages },
    };
  }

  async findOne(userId: string, id: string): Promise<ProductionDetail> {
    const production = await this.prisma.production.findFirst({
      where: { id, userId },
      include: productionDetailInclude,
    });

    if (!production) {
      throw new NotFoundException('Production not found');
    }

    return toProductionDetail(production);
  }

  async create(userId: string, dto: CreateProductionDto): Promise<ProductionDetail> {
    const totalDuration = sumDurationMinutes(dto.runSheetItems);
    const startTime = parseTimeString(dto.startTime);
    const endTime = computeEndTimeDate(dto.startTime, totalDuration);

    const production = await this.prisma.$transaction(async (tx) => {
      return tx.production.create({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          eventDate: parseDateString(dto.eventDate),
          startTime,
          startsAt: new Date(dto.startsAt),
          endTime: endTime ?? undefined,
          runSheetItems: {
            create: dto.runSheetItems.map((item, index) => ({
              sequence: index + 1,
              title: item.title,
              durationMinutes: item.durationMinutes,
              notes: item.notes,
            })),
          },
        },
        include: productionDetailInclude,
      });
    });

    return toProductionDetail(production);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProductionDto,
  ): Promise<ProductionDetail> {
    const existing = await this.findOwnedOrThrow(userId, id);

    const production = await this.prisma.$transaction(async (tx) => {
      await tx.production.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.eventDate !== undefined && {
            eventDate: dto.eventDate ? parseDateString(dto.eventDate) : null,
          }),
          ...(dto.startTime !== undefined && {
            startTime: dto.startTime ? parseTimeString(dto.startTime) : null,
          }),
          ...(dto.startsAt !== undefined && {
            startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
          }),
          ...(dto.status !== undefined && { status: dto.status }),
        },
      });

      await this.syncEndTime(tx, id);

      return tx.production.findUniqueOrThrow({
        where: { id },
        include: productionDetailInclude,
      });
    });

    if (
      dto.status === ProductionStatus.SCHEDULED &&
      existing.status !== ProductionStatus.SCHEDULED
    ) {
      this.notifyProductionScheduled(userId, production);
    }

    return toProductionDetail(production);
  }

  private notifyProductionScheduled(
    userId: string,
    production: Production & { startsAt: Date | null },
  ): void {
    if (!production.startsAt) {
      return;
    }

    const timeUntil = formatTimeUntilEvent(production.startsAt);

    void this.notificationsService
      .notifyAndPush(userId, {
        type: NotificationType.PRODUCTION_SCHEDULED,
        title: `${production.title} is Scheduled`,
        body: `starts in ${timeUntil}`,
        productionId: production.id,
        url: `/productions/${production.id}`,
      })
      .catch(() => undefined);
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

      await this.syncEndTime(tx, id);

      return tx.production.findUniqueOrThrow({
        where: { id },
        include: productionDetailInclude,
      });
    });

    return toProductionDetail(production);
  }

  async replaceAssignments(
    userId: string,
    id: string,
    dto: ReplaceAssignmentsDto,
  ): Promise<ProductionDetail> {
    await this.findOwnedOrThrow(userId, id);

    const uniqueCrewIds = [...new Set(dto.crewMemberIds)];
    const equipmentById = new Map(
      dto.equipment.map((item) => [item.equipmentId, item.quantity ?? 1]),
    );
    const uniqueEquipmentIds = [...equipmentById.keys()];

    if (uniqueCrewIds.length > 0) {
      const crewCount = await this.prisma.crewMember.count({
        where: { userId, id: { in: uniqueCrewIds } },
      });

      if (crewCount !== uniqueCrewIds.length) {
        throw new NotFoundException('One or more crew members not found');
      }
    }

    if (uniqueEquipmentIds.length > 0) {
      const equipmentCount = await this.prisma.equipment.count({
        where: { userId, id: { in: uniqueEquipmentIds } },
      });

      if (equipmentCount !== uniqueEquipmentIds.length) {
        throw new NotFoundException('One or more equipment items not found');
      }
    }

    const production = await this.prisma.$transaction(async (tx) => {
      await tx.productionCrewAssignment.deleteMany({ where: { productionId: id } });
      await tx.productionEquipmentAssignment.deleteMany({ where: { productionId: id } });

      if (uniqueCrewIds.length > 0) {
        await tx.productionCrewAssignment.createMany({
          data: uniqueCrewIds.map((crewMemberId) => ({
            productionId: id,
            crewMemberId,
          })),
        });
      }

      if (dto.equipment.length > 0) {
        await tx.productionEquipmentAssignment.createMany({
          data: uniqueEquipmentIds.map((equipmentId) => ({
            productionId: id,
            equipmentId,
            quantity: equipmentById.get(equipmentId) ?? 1,
          })),
        });
      }

      return tx.production.findUniqueOrThrow({
        where: { id },
        include: productionDetailInclude,
      });
    });

    return toProductionDetail(production);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.findOwnedOrThrow(userId, id);
    await this.prisma.production.delete({ where: { id } });
    return { ok: true };
  }

  private async syncEndTime(tx: PrismaTx, productionId: string): Promise<void> {
    const production = await tx.production.findUniqueOrThrow({
      where: { id: productionId },
      include: { runSheetItems: true },
    });

    const startTimeStr = toTimeString(production.startTime);
    const totalDuration = sumDurationMinutes(production.runSheetItems);

    await tx.production.update({
      where: { id: productionId },
      data: {
        endTime: computeEndTimeDate(startTimeStr, totalDuration),
      },
    });
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
