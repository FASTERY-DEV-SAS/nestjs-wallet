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
  constructor(
    @Inject(WalletsService)
    private readonly walletsService: WalletsService,
  ) {}

  async createNewTransaction(
    walletId: string,
    amount: number,
    meta: any,
    type: string
  ): Promise<Transaction> {
    const transaction = new Transaction();
    // TODO: ELIMINAR LA CONSULTA
    transaction.wallet = await this.walletsService.getWalletOne(walletId);
    transaction.amount = amount;
    transaction.confirmed = true; 
    transaction.type = type;
    transaction.meta = meta;
    return transaction;
  }
  
}
