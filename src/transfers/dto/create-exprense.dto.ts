import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { RateDto } from './rate.dto';
export class CreateExpenseDto {

  @ApiProperty({
    example: [
      {
        type: 'tax',
        incomeExpenseType: 'income',
        subType: 'revenue_admin',
        typeRate: 'fixed',
        value: 10,
        meta: {
          funcionalidad: "recargabemovil"
        }
      },
      {
        type: 'commission',
        incomeExpenseType: 'expense',
        subType: 'revenue_pdv',
        typeRate: 'fixed',
        value: 10,
        meta: {
          funcionalidad: "recargabemovil"
        }
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
    example: '7ed553ef-6641-4872-b6fd-efaa779848b1',
    description: 'Wallet ID selected',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  walletId: Wallet['id'];;

  @ApiProperty({
    example: '5cf1f1da-3e6c-492a-8434-C994e006ce41',
    description: 'Category ID selected',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  categoryId: Category['id'];
}