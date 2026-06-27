import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@find-matching-jobs/types';

export class JobsFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  empresa?: string;
}
