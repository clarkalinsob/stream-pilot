import { EquipmentCategory } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(EquipmentCategory)
  category!: EquipmentCategory;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
