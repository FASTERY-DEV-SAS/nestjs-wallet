import { IsNumber, IsObject, IsOptional, IsPositive, IsString, Matches, MinLength, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';

export class CreateIncomeDto {
  @IsNumber()
  @IsPositive()
  amount: number;
  // TODO: AGREGAR EL MATACH DE 2 DECIMALES

  @IsObject()
  meta: any | null;

  @IsString()
  @MinLength(3) 
  walletIdSelected: Wallet['id'];
  
  @IsString()
  @MinLength(3)
  categoryIdSelected: Category['id'];

  @IsNumber()
  @IsPositive()
  @IsOptional()
  fee: number;

  @IsObject()
  @IsOptional()
  feeMeta: any | null;
}
