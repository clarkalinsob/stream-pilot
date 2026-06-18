import { IsIn, IsOptional } from 'class-validator';
import { ListSearchQueryDto } from '../../common/dto/list-search-query.dto';
import type { SortOrder } from '../../common/list-query.util';

export const PRODUCTION_SORT_FIELDS = [
  'title',
  'eventDate',
  'startTime',
  'endTime',
  'status',
  'segmentCount',
] as const;
export type ProductionSortField = (typeof PRODUCTION_SORT_FIELDS)[number];

export class ListProductionsQueryDto extends ListSearchQueryDto {
  @IsOptional()
  @IsIn(PRODUCTION_SORT_FIELDS)
  sort?: ProductionSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: SortOrder;
}
