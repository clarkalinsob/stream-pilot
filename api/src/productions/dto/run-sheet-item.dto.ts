import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class RunSheetItemDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
