import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {

  constructor(private readonly walletsService: WalletsService) { }
  // USER+
  @Post('createWallet')
  @Auth(ValidRoles.user, ValidRoles.admin)
  create(@Body() createWalletDto: CreateWalletDto, @GetUser() user: User) {
    return this.walletsService.createWallet(createWalletDto, user);
  }

  @Patch('updateWallet/:id')
  @Auth(ValidRoles.user, ValidRoles.admin)
  updateWallet(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletsService.updateWallet(id, updateWalletDto);
  }

  @Get('getWallet/:id')
  @Auth(ValidRoles.user)
  getWallet(@Param('id') id: string, @GetUser() user: User) {
    return this.walletsService.getWallet(id, user);
  }

  @Get('overallBalance')
  @Auth(ValidRoles.user, ValidRoles.admin)
  overallBalance1(@GetUser() user: User) {
    return this.walletsService.getTotalAmountOfWallets(user);
  }
  // USER+
  @Get('getWallets')
  @Auth(ValidRoles.user)
  getWallets(@GetUser() user: User) {
    return this.walletsService.getWallets(user);
  }

  // ADMIN
  @Get('updateWalletBalance/:id')
  updateWalletBalance(@Param('id') id: string) {
    return this.walletsService.updateWalletBalance(id);
  }

  @Get('validateWalletBalance/:id')
  validateWalletBalance(@Param('id') id: string) {
    return this.walletsService.validateWalletBalance(id);
  }
}
