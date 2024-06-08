import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, MaxLength, MinLength, } from 'class-validator';


export class CreateWalletDto {
  @ApiProperty({
    example: 'BANCO DE ECUADOR',
    description: 'The name of the wallet',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  label_wallet: string;

  @ApiProperty({
    example: 'This is a wallet for saving money.',
    description: 'The description of the wallet.',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  description_wallet: string;

  @ApiProperty({
    example: 'USD',
    description: 'The currency of the wallet. It can be any currency.',
    nullable: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(12)
  currency: string;

  @ApiProperty({
    example: { "currency": "USD" },
    description: 'The meta data of the wallet. It can be any object.',
    nullable: false,
  })
  @IsObject()
  @IsOptional()
  meta: any | null;

  @ApiProperty({
    example: 'saving',
    description: 'The type of the wallet. It can be regular, saving or current.',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  @IsIn(["regular", "saving", "current"])
  type: string;
}
