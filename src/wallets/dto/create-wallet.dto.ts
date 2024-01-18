import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateWalletDto {
    @IsString()
    @MinLength(3)
    label_wallet: string;

    @IsString()
    @MinLength(3)
    description: string;
}
