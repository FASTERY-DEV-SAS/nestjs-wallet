import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { WalletsModule } from 'src/wallets/wallets.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { AuthModule } from 'src/auth/auth.module';
import { Category } from './entities/category.entity';

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  imports: [
    AuthModule,
    WalletsModule,
    TransactionsModule,
    TypeOrmModule.forFeature([Transfer,Category]),
  ],
  exports: [TransfersService, TypeOrmModule],
})
export class TransfersModule {}
