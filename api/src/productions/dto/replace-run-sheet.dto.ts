import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { RunSheetItemDto } from './run-sheet-item.dto';

export class ReplaceRunSheetDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RunSheetItemDto)
  items!: RunSheetItemDto[];
}
