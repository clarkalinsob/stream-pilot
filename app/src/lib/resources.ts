import type { CrewRole } from '@/types/crew';
import type { EquipmentCategory } from '@/types/equipment';

const crewRoleLabels: Record<CrewRole, string> = {
  CAMERAMAN: 'Cameraman',
  AUDIOMAN: 'Audioman',
  OPERATOR: 'Operator',
  MIC_MAN: 'Mic Man',
  RUNNER: 'Runner',
  DIRECTOR: 'Director',
  TALENT: 'Talent',
  VIDEO: 'Video',
  EDITOR: 'Editor',
  PRODUCER: 'Producer',
  FLOOR: 'Floor',
  OTHER: 'Other',
};

const equipmentCategoryLabels: Record<EquipmentCategory, string> = {
  CAMERA: 'Camera',
  AUDIO: 'Audio',
  LIGHTING: 'Lighting',
  ELECTRICAL: 'Electrical',
  VIDEO: 'Video',
  LAPTOP: 'Laptop',
  PC: 'PC',
  OTHER: 'Other',
};

export const CREW_ROLES = Object.keys(crewRoleLabels) as CrewRole[];
export const EQUIPMENT_CATEGORIES = Object.keys(
  equipmentCategoryLabels,
) as EquipmentCategory[];

export function formatCrewRole(role: CrewRole | string): string {
  return crewRoleLabels[role as CrewRole] ?? role.replace(/_/g, ' ');
}

export function formatEquipmentCategory(category: EquipmentCategory): string {
  return equipmentCategoryLabels[category];
}

export function isCrewRole(value: string): value is CrewRole {
  return value in crewRoleLabels;
}
