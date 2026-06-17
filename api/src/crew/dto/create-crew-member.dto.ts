import { CrewRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateCrewMemberDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(CrewRole)
  role!: CrewRole;

  @IsOptional()
  @ValidateIf((_, value) => value != null && value !== '')
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
