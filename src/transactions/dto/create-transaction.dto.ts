import { IsIn, IsNumber, IsString } from "class-validator";

export class CreateTransactionDto {

    @IsString()
    @IsIn(['withdraw','deposit'])
    type: string;

    @IsNumber()
    amount: number;

}
