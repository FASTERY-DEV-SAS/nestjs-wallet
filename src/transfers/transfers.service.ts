import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';

@Injectable()
export class TransfersService {

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
  ) {}

  async transferMoney(fromWalletId: string, toWalletId: string, amount: number): Promise<void> {
    // Iniciar una transacción
    const queryRunner = this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Realizar la transacción de retiro
      const withdrawTransaction = await this.createTransaction(fromWalletId, amount * -1);
      await this.transactionRepository.save(withdrawTransaction);

      // Realizar la transacción de depósito
      const depositTransaction = await this.createTransaction(toWalletId, amount);
      await this.transactionRepository.save(depositTransaction);

      // Actualizar los saldos de las billeteras
      await this.updateWalletBalance(fromWalletId);
      await this.updateWalletBalance(toWalletId);

      // Confirmar la transacción
      await queryRunner.commitTransaction();
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar el query runner
      await queryRunner.release();
    }
  }

  private async createTransaction(walletId: string, amount: number): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.wallet = await this.walletRepository.findOneOrFail({ where: { id: walletId }, relations: ['transactions'] });
    transaction.amount = amount;
    transaction.confirmed = true; // Puedes ajustar esto según tus necesidades
    transaction.type = amount > 0 ? 'deposit' : 'withdraw'; // Puedes ajustar esto según tus necesidades
    return transaction;
  }

  private async updateWalletBalance(walletId: string): Promise<void> {
    const wallet = await this.walletRepository.findOneOrFail({ where: { id: walletId }, relations: ['transactions'] });
  
    // Filtrar solo transacciones confirmadas y relacionadas con esta billetera
    const relevantTransactions = wallet.transactions.filter(
      (transaction) => transaction.confirmed 
    );
    console.log(relevantTransactions);
  
    // Calcular el nuevo saldo sumando o restando según el tipo de transacción
    wallet.balance = relevantTransactions.reduce((total, transaction) => {
      return total + (transaction.type === 'deposit' ? +transaction.amount : +transaction.amount);
    }, 0);
    console.log(wallet.balance);
    // Guardar el nuevo saldo en la base de datos
    await this.walletRepository.save(wallet);
  }

  create(createTransferDto: CreateTransferDto) {
    return 'This action adds a new transfer';
  }

  findAll() {
    return `This action returns all transfers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transfer`;
  }

  update(id: number, updateTransferDto: UpdateTransferDto) {
    return `This action updates a #${id} transfer`;
  }

  remove(id: number) {
    return `This action removes a #${id} transfer`;
  }
}
