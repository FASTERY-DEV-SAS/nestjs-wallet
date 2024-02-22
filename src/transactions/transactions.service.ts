import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { WalletsService } from 'src/wallets/wallets.service';

@Injectable()
export class TransactionsService {
  createNewTransaction(
    walletId: string, // Solo el ID de la cartera
    amount: number,
    meta: any,
    type: string
  ) {
    if (!walletId || typeof walletId !== 'string') {
      throw new Error('Invalid walletId');
    }
    const transaction = new Transaction();
    transaction.wallet = { id: walletId } as Wallet;
    transaction.amount = amount;
    transaction.confirmed = true;
    transaction.type = type;
    transaction.meta = meta;
    return transaction;
  }
}
