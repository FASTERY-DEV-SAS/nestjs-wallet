import { IsIn, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @MinLength(5)
  fromWalletId: string

  @IsString()
  @MinLength(5)
  toWalletId: string
  
  @IsNumber()
  @IsPositive()
  amount: number

  @IsNumber()
  fee: number

  @IsNumber()
  revenue: number
}
