import { IsOptional, Min, Max } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { PaginationDto } from '@find-matching-jobs/types';

export class MatchesQueryDto extends PaginationDto {
  @Expose({ name: 'min_score' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  minScore?: number;
}
