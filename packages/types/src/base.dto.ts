import { IsOptional, IsNumber, Min, Max, IsString, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class ApiResponseDto<T> {
  success!: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }
}

export class BaseEntityDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
