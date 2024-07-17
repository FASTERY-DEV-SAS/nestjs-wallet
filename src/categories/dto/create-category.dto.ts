import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    name: string;

    @IsString()
    @MinLength(3)
    @MaxLength(150)
    description: string;

    @IsString()
    @MinLength(3)
    @IsIn(["income","expense"]) 
    type: string;
}
