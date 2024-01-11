import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { Wallet } from './entities/wallet.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Wallet
    ])
  ],
  exports: [WalletsService]
})
export class WalletsModule {}

