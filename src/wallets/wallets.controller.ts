import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('createWallet')
  @Auth(ValidRoles.user)
  createWallet(@Body() createWalletDto: CreateWalletDto, @GetUser() user: User) {
    return this.walletsService.createWallet(createWalletDto, user);
  }

  @Get('wallet/:id')
  @Auth(ValidRoles.user, ValidRoles.admin)
  getWalletOneAuth(@Param('id') id: string, @GetUser() user: User) {
    return this.walletsService.getWalletOneAuth(id,user);
  }

  @Get('refreshBalance/:id')
  updateWalletBalance(@Param('id') id: string) {
    return this.walletsService.updateWalletBalance(id);
  }

  @Get('showWallets')
  @Auth(ValidRoles.user)
  showWallets(@GetUser() user: User) {
    return this.walletsService.showWallets(user);
  }

}
