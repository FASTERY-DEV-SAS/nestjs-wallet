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

  @Post()
  create(@Body() createTransferDto: CreateTransferDto) {
    return this.transfersService.create(createTransferDto);
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
