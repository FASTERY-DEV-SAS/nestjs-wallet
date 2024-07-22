import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class PaginationCategoryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Type(() => Number)
  year: number;

  @IsString()
  @IsOptional()
  walletId: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  subType: string;

  @IsString()
  @IsOptional()
  search: string;

}
