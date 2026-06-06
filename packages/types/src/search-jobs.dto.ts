import { IsString, IsOptional } from 'class-validator';
import { PaginationDto } from './base.dto';

export class SearchJobsDto extends PaginationDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsString()
  location?: string;
}
