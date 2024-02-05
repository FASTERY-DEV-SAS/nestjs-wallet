import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsString()
  month: string;

  @IsString()
  year: string;
}
