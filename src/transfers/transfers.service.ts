import { Inject, Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { WalletsService } from 'src/wallets/wallets.service';

@Injectable()
export class TransfersService {
  
  constructor(
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,

    @Inject(WalletsService)
    private readonly walletsService: WalletsService,
    
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
  ) {}
  
  async transferWalletToWallet(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    fee: number,
    revenue: number,
  ) {
    await this.walletsService.validateAmountToTransfer(amount);

    const fromWallet = await this.walletsService.getWalletOne(fromWalletId);

    await this.walletsService.containsBalance(fromWallet,amount);

    const toWallet = await this.walletsService.getWalletOne(toWalletId);

    // Iniciar una transacción
    const queryRunner = this.transferRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Realizar la transacción de retiro
      const withdrawTransaction = await this.transactionsService.createNewTransaction(
        fromWalletId,
        amount * -1,
      );
      await this.transactionRepository.save(withdrawTransaction);

      // Realizar la transacción de depósito
      const depositTransaction = await this.transactionsService.createNewTransaction(
        toWalletId,
        amount,
      );
      await this.transactionRepository.save(depositTransaction);

      const feeTransaction = await this.transactionsService.createNewTransaction(
        fromWalletId,
        fee* -1,
      );
      await this.transactionRepository.save(feeTransaction);

      const revenueTransaction = await this.transactionsService.createNewTransaction(
        fromWalletId,
        revenue,
      );
      await this.transactionRepository.save(revenueTransaction);


      const transfer = this.transferRepository.create({
        status: 'transfer',
        deposit: depositTransaction,
        withdraw: withdrawTransaction,
        fromUser: fromWallet.user,
        toUser: toWallet.user,
        revenue: revenueTransaction,
        fee: feeTransaction,
      });

      // Actualizar los saldos de las billeteras 
      // FIXME: Crear otro endpoint para actualizar el saldo de la billetera
      await this.walletsService.updateWalletBalance(fromWalletId);
      await this.walletsService.updateWalletBalance(toWalletId);

      await this.transferRepository.save(transfer);

      // Confirmar la transacción
      await queryRunner.commitTransaction();
      return { message: 'Transferencia realizada con éxito', status: true };

    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      return { message: 'Error al realizar la transferencia', status: false };
    } finally {
      await queryRunner.release();
    }
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
