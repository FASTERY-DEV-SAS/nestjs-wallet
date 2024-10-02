import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  day: number;

  @IsOptional()
  @Type(() => Number)
  month: number;

  @IsOptional()
  @Type(() => Number)
  year: number;

  @IsString()
  @IsOptional()
  walletId: string;

  @IsString()
  @IsOptional()
  categoryId: string;

  @IsString()
  @IsIn(['expense', 'income', 'all'])
  type: string;

  @IsString()
  @IsOptional()
  search: string;
}
