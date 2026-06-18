import { IsIn, IsOptional } from 'class-validator';
import { ListSearchQueryDto } from '../../common/dto/list-search-query.dto';
import type { SortOrder } from '../../common/list-query.util';

export const CREW_SORT_FIELDS = ['name', 'role', 'email', 'phone'] as const;
export type CrewSortField = (typeof CREW_SORT_FIELDS)[number];

export class ListCrewQueryDto extends ListSearchQueryDto {
  @IsOptional()
  @IsIn(CREW_SORT_FIELDS)
  sort?: CrewSortField;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: SortOrder;
}
