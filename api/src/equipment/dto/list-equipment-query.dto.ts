import { IsIn, IsOptional } from 'class-validator';
import { ListSearchQueryDto } from '../../common/dto/list-search-query.dto';
import type { SortOrder } from '../../common/list-query.util';

export const EQUIPMENT_SORT_FIELDS = ['name', 'category', 'quantity'] as const;
export type EquipmentSortField = (typeof EQUIPMENT_SORT_FIELDS)[number];

export class ListEquipmentQueryDto extends ListSearchQueryDto {
  @IsOptional()
  @IsIn(EQUIPMENT_SORT_FIELDS)
  sort?: EquipmentSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: SortOrder;
}
