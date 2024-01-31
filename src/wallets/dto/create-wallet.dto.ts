import {IsIn, IsObject, IsString, MaxLength, MinLength,  } from 'class-validator';


export class CreateWalletDto {
  @IsString()
  @MinLength(3)
  label_wallet: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  description_wallet: string;

  @IsObject()
  meta: any | null;

  @IsString()
  @MinLength(3)
  @IsIn(["regular","saving","current"])
  type: string;
}
