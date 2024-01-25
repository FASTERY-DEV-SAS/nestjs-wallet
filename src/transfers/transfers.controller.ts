import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { WalletsService } from 'src/wallets/wallets.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-exprense.dto';

@Controller('transfers')
export class TransfersController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly transfersService: TransfersService,
  ) {}

  @Post('transfer')
  async transferWalletToWallet(
    @Body()
    transferData: {
      fromWalletId: string;
      toWalletId: string;
      amount: number;
      fee: number;
      discount: number;

    },
  ) {
    const { fromWalletId, toWalletId, amount,fee,discount } = transferData;
    return this.transfersService.transferWalletToWallet(
      fromWalletId,
      toWalletId,
      amount,
      fee,
      discount
    );
  }

  @Post('createIncome')
  @Auth(ValidRoles.user)
  createIncome(@Body()
  createIncomeDto: CreateIncomeDto, @GetUser() user: User) {
    return this.transfersService.createIncome(createIncomeDto,user);
  }
  
  @Post('createExpense')
  @Auth(ValidRoles.user)
  createExpense(@Body()
  createExpenseDto: CreateExpenseDto, @GetUser() user: User) {
    return this.transfersService.createExpense(createExpenseDto,user);
  }

  @Get()
  findAll() {
    return this.transfersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transfersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransferDto: UpdateTransferDto,
  ) {
    return this.transfersService.update(+id, updateTransferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transfersService.remove(+id);
  }
}
