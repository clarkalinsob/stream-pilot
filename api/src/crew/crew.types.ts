import { CrewMember, CrewRole } from '@prisma/client';

export type CrewMemberSummary = {
  id: string;
  name: string;
  role: CrewRole;
  contact: string | null;
  assignmentCount: number;
};

export type CrewMemberDetail = CrewMemberSummary & {
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedCrewResponse = {
  data: CrewMemberSummary[];
  meta: PaginationMeta;
};

type CrewMemberWithCount = CrewMember & {
  _count: { assignments: number };
};

export function toCrewMemberSummary(member: CrewMemberWithCount): CrewMemberSummary {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    contact: member.contact,
    assignmentCount: member._count.assignments,
  };
}

export function toCrewMemberDetail(member: CrewMemberWithCount): CrewMemberDetail {
  return {
    ...toCrewMemberSummary(member),
    notes: member.notes,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}
