import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('transfers')
export class TransfersController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly transfersService: TransfersService,
  ) {}

  @Post('transfer')
  @Auth(ValidRoles.user)
  transferWalletToWallet(@Body() createTransferDto: CreateTransferDto, @GetUser() user: User) {
    return this.transfersService.transferWalletToWallet(createTransferDto,user);
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

  @Get('allTransfers')
  @Auth(ValidRoles.user)
  allTransfers(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.transfersService.allTransfers(user,paginationDto);
  }

  @Get(':id')
  // @Auth(ValidRoles.user)
  findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

}
