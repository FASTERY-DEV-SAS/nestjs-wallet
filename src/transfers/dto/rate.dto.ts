import { IsArray, IsIn, IsNumber, IsObject, IsString } from 'class-validator';

export class RateDto {
  @IsString()
  @IsIn(['tax', 'commission'])
  type: string;

  @IsString()
  @IsIn(['income', 'expense'])
  incomeExpenseType: string;

  @IsString()
  subType: string;

  @IsString()
  @IsIn(['percentage', 'fixed'])
  typeRate: string;

  @IsNumber()
  value: number;

  @IsArray()
  @IsObject({ each: true })
  meta: Record<string, any>[];
}
