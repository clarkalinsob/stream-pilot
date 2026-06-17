import { CrewRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCrewMemberDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(CrewRole)
  role!: CrewRole;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
