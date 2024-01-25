import { IsNumber, IsObject, IsPositive, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsObject()
  meta: any | null;
  
  @IsNumber()
  fee: number;
  
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  walletIdSelected: string;

}
