import { IsIn, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsIn(['exchange', 'transfer','refund','incomes','expenses'])
  type: string;
}
