import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class EquipmentAssignmentItemDto {
  @IsString()
  equipmentId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class ReplaceAssignmentsDto {
  @IsArray()
  @IsString({ each: true })
  crewMemberIds!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentAssignmentItemDto)
  equipment!: EquipmentAssignmentItemDto[];
}
