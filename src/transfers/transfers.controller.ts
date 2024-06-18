import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  Logger,
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
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationRateDto } from './dto/pagination-rate.dto';

@ApiTags('Transfers')
@ApiBearerAuth()
@Controller('transfers')
export class TransfersController {
  private isProcessing = false;
  private queue: { createIncomeDto: CreateIncomeDto, user: User }[] = [];
  constructor(
    private readonly walletsService: WalletsService,
    private readonly transfersService: TransfersService,
  ) { }

  @Post('transfer')
  @Auth(ValidRoles.user)
  transferWalletToWallet(@Body() createTransferDto: CreateTransferDto, @GetUser() user: User) {
    return this.transfersService.transferWalletToWallet(createTransferDto, user);
  }

  @Post('createExpense')
  @Auth(ValidRoles.user, ValidRoles.admin)
  async createExpenseController(@Body() createExpenseDto: CreateExpenseDto, @GetUser() user: User) {
    return this.transfersService.createExpense(createExpenseDto, user);
  }

  @Post('createIncome')
  @Auth(ValidRoles.user, ValidRoles.admin)
  async createIncomeController(@Body() createIncomeDto: CreateIncomeDto, @GetUser() user: User) {
    return this.transfersService.createIncome(createIncomeDto, user);
  }

  @Get('allTransfers')
  @Auth(ValidRoles.user)
  allTransfers(@GetUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.transfersService.allTransfers(user, paginationDto);
  }

  @Get('rates')
  @Auth(ValidRoles.user)
  showRates(@GetUser() user: User, @Query() paginationRateDto: PaginationRateDto) {
    return this.transfersService.showRates(user, paginationRateDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.transfersService.findOne(id);
  // }

 

}
