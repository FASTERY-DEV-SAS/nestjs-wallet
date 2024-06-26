import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { RateDto } from './rate.dto';
export class CreateExpenseDto {
  @IsObject()
  @IsOptional()
  meta: any | null;

  @ApiProperty({
    example: [
      {
        type: 'tax',
        incomeExpenseType: 'income',
        typeAmount: 'percentage',
        amount: 10,
      },
      {
        type: 'commission',
        incomeExpenseType: 'expense',
        typeAmount: 'fixed',
        amount: 10,
      },
    ],
    description: 'Rates of the transaction',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateDto)
  rates: RateDto[] | null;

  @ApiProperty({
    example: '2536',
    description: 'Amount of the transaction ($25,36)',
    nullable: false,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: '5f9d3d2e-5b3b-4b3e-8b9b-5c1e5e4c9c7d',
    description: 'Wallet ID selected',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  walletIdSelected: Wallet['id'];;

  @ApiProperty({
    example: '5f9d3d2e-5b3b-4b3e-8b9b-5c1e5e4c9c7d',
    description: 'Category ID selected',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  categoryIdSelected: Category['id'];
}