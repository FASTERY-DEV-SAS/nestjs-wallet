import { IsNumber, IsObject, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateExpenseDto {
  @IsObject()
  meta: any | null;
  
  @IsNumber()
  @IsPositive()
  @IsOptional()
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
