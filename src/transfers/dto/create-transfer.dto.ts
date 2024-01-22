import { IsIn, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsIn(['exchange', 'transfer', 'paid', 'refund', 'gift','incomes','expenses'])
  type: string;
}
