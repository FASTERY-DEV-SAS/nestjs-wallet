import { IsIn, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsIn(['exchange', 'transfer', 'paid', 'refund', 'gift'])
  type: string;
}
