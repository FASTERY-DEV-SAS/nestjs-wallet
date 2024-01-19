import { IsOptional, IsString, Max, MaxLength, MinLength } from "class-validator";

export class CreateWalletDto {
    @IsString()
    @MinLength(3)
    label_wallet: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    description: string;
}
