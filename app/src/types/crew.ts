import type { PaginationMeta } from '@/types/production';

export type CrewRole =
  | 'CAMERAMAN'
  | 'AUDIOMAN'
  | 'OPERATOR'
  | 'MIC_MAN'
  | 'RUNNER'
  | 'DIRECTOR'
  | 'TALENT'
  | 'VIDEO'
  | 'EDITOR'
  | 'PRODUCER'
  | 'FLOOR'
  | 'OTHER';

export type CrewMemberSummary = {
  id: string;
  name: string;
  role: CrewRole;
  email: string | null;
  phone: string | null;
  assignmentCount: number;
};

export type CrewMemberDetail = CrewMemberSummary & {
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedCrew = {
  data: CrewMemberSummary[];
  meta: PaginationMeta;
};

export type CreateCrewMemberData = {
  name: string;
  role: CrewRole;
  email?: string;
  phone?: string;
  notes?: string;
};

export type UpdateCrewMemberData = {
  name?: string;
  role?: CrewRole;
  email?: string | null;
  phone?: string | null;
  notes?: string;
};
