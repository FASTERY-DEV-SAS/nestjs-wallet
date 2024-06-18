import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
export class RateDto {
  @IsString()
  @IsIn(['tax', 'commission'])
  type: string;

  @IsString()
  @IsIn(['income', 'expense'])
  incomeExpenseType: string;

  @IsString()
  subType: string;

  @IsString()
  @IsIn(['percentage', 'fixed'])
  typeRate: string;

  @IsNumber()
  value: number;
}