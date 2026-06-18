import { Injectable, NotFoundException } from '@nestjs/common';
import { CrewMember } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCrewMemberDto } from './dto/create-crew-member.dto';
import { CREW_SORT_FIELDS, ListCrewQueryDto } from './dto/list-crew-query.dto';
import { UpdateCrewMemberDto } from './dto/update-crew-member.dto';
import { resolveOrderBy } from '../common/list-query.util';
import {
  CrewMemberDetail,
  PaginatedCrewResponse,
  toCrewMemberDetail,
  toCrewMemberSummary,
} from './crew.types';

@Injectable()
export class CrewService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    query: ListCrewQueryDto,
  ): Promise<PaginatedCrewResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = { userId };

    const orderBy = resolveOrderBy(
      query.sort,
      query.order,
      CREW_SORT_FIELDS,
      [{ name: 'asc' }, { updatedAt: 'desc' }],
    );

    const [members, total] = await Promise.all([
      this.prisma.crewMember.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { assignments: true } } },
        orderBy,
      }),
      this.prisma.crewMember.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: members.map(toCrewMemberSummary),
      meta: { page, limit, total, totalPages },
    };
  }

  async findOne(userId: string, id: string): Promise<CrewMemberDetail> {
    const member = await this.prisma.crewMember.findFirst({
      where: { id, userId },
      include: { _count: { select: { assignments: true } } },
    });

    if (!member) {
      throw new NotFoundException('Crew member not found');
    }

    return toCrewMemberDetail(member);
  }

  async create(userId: string, dto: CreateCrewMemberDto): Promise<CrewMemberDetail> {
    const member = await this.prisma.crewMember.create({
      data: {
        userId,
        name: dto.name,
        role: dto.role,
        email: dto.email,
        phone: dto.phone,
        notes: dto.notes,
      },
      include: { _count: { select: { assignments: true } } },
    });

    return toCrewMemberDetail(member);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCrewMemberDto,
  ): Promise<CrewMemberDetail> {
    await this.findOwnedOrThrow(userId, id);

    const member = await this.prisma.crewMember.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: { _count: { select: { assignments: true } } },
    });

    return toCrewMemberDetail(member);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.findOwnedOrThrow(userId, id);
    await this.prisma.crewMember.delete({ where: { id } });
    return { ok: true };
  }

  private async findOwnedOrThrow(userId: string, id: string): Promise<CrewMember> {
    const member = await this.prisma.crewMember.findFirst({
      where: { id, userId },
    });

    if (!member) {
      throw new NotFoundException('Crew member not found');
    }

    return member;
  }
}
