import { IsIn, IsObject, IsOptional, IsString, MaxLength, MinLength, } from 'class-validator';


export class UpdateWalletDto {
    @IsString()
    @MinLength(3)
    @IsOptional()
    label_wallet: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @IsOptional()
    description_wallet: string;

    @IsObject()
    @IsOptional()
    meta: any | null;

    @IsString()
    @MinLength(3)
    @IsIn(["regular", "saving", "current"])
    @IsOptional()
    type: string;
}
