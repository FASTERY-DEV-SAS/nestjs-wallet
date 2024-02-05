import { IsNumber, IsObject, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateIncomeDto {
  @IsObject()
  meta: any | null;
  
  @IsNumber()
  fee: number;
  
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @MinLength(3)
  walletIdSelected: string;
  
  @IsString()
  @MinLength(3)
  categoryIdSelected: string;

}
