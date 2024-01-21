import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from 'src/wallets/entities/wallet.entity';

@Injectable()
export class TransactionsService {
  constructor( 
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,


    private readonly dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, user: User) {
    return `This action returns create transactions`;
  }

  async createTransaction(
    walletId: string,
    amount: number,
  ): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.wallet = await this.walletRepository.findOneOrFail({
      where: { id: walletId },
      relations: ['transactions'],
    });
    transaction.amount = amount;
    transaction.confirmed = true; // Puedes ajustar esto según tus necesidades
    transaction.type = amount > 0 ? 'deposit' : 'withdraw'; // Puedes ajustar esto según tus necesidades
    return transaction;
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
