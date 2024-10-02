import { forwardRef, Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TransfersModule } from 'src/transfers/transfers.module';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService],
  imports: [
    AuthModule,
    forwardRef(() => TransfersModule),
    TypeOrmModule.forFeature([Wallet]),
  ],
  exports: [WalletsService,TypeOrmModule],
})
export class WalletsModule { }
