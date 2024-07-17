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
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  search: string;

}
