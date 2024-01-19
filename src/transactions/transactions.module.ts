import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { AuthModule } from 'src/auth/auth.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { WalletsService } from 'src/wallets/wallets.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [
    WalletsModule,
    AuthModule, 
    TypeOrmModule.forFeature([
      Transaction
    ])
  ],
  exports: []
})
export class TransactionsModule {}
