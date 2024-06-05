import {
  Controller,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {

}
