import { Inject, Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-exprense.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { retry } from 'rxjs';

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
    await this.walletsService.validateAmount(amount);

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
        "withdrawTransaction"
      );
      await this.transactionRepository.save(withdrawTransaction);

      const depositTransaction = await this.transactionsService.createNewTransaction(
        toWalletId,
        amount,
        "depositTransaction"
      );
      await this.transactionRepository.save(depositTransaction);

      const feeTransaction = await this.transactionsService.createNewTransaction(
        fromWalletId,
        fee* -1,
        "feeTransaction"
      );
      await this.transactionRepository.save(feeTransaction);

      const revenueTransaction = await this.transactionsService.createNewTransaction(
        fromWalletId,
        revenue,
        "revenueTransaction"
      );
      await this.transactionRepository.save(revenueTransaction);


      const transfer = this.transferRepository.create({
        status: 'transfer',
        deposit: depositTransaction,
        withdraw: withdrawTransaction,
        fromWallet: fromWallet,
        toWallet: toWallet,
        revenue: revenueTransaction,
        fee: feeTransaction,
      });

      // Actualizar los saldos de las billeteras 
      // FIXME: Crear otro endpoint para actualizar el saldo de la billetera
      console.log('transfer', transfer);

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

  async createIncome(createIncomeDto: CreateIncomeDto, user:User) {

    await this.walletsService.walletIdExistsInUser(createIncomeDto.walletIdSelected,user);

    await this.walletsService.validateAmount(createIncomeDto.amount);

    const fromWallet = await this.walletsService.getWalletOne(createIncomeDto.walletIdSelected);
    // Iniciar una transacción
    const queryRunner = this.transferRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

   try {
      // Realizar la transacción de retiro
      const withdrawTransaction = await this.transactionsService.createNewTransaction(
        createIncomeDto.walletIdSelected,
        0,
        "withdrawTransaction"
      );
      await this.transactionRepository.save(withdrawTransaction);

      const depositTransaction = await this.transactionsService.createNewTransaction(
        createIncomeDto.walletIdSelected,
        createIncomeDto.amount,
        createIncomeDto.meta
      );
      await this.transactionRepository.save(depositTransaction);

      const feeTransaction = await this.transactionsService.createNewTransaction(
        createIncomeDto.walletIdSelected,
        createIncomeDto.fee* -1,
        "feeTransaction"
      );
      await this.transactionRepository.save(feeTransaction);

      const revenueTransaction = await this.transactionsService.createNewTransaction(
        createIncomeDto.walletIdSelected,
        0,
        "revenueTransaction"
      );
      await this.transactionRepository.save(revenueTransaction);

      const transfer = this.transferRepository.create({
        status: 'incomes',
        deposit: depositTransaction,
        withdraw: withdrawTransaction,
        fromWallet: fromWallet,
        toWallet: fromWallet,
        revenue: revenueTransaction,
        fee: feeTransaction,
      });
      console.log('transfer', transfer);

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

  async createExpense(createExpenseDto: CreateExpenseDto,user:User) {

    await this.walletsService.walletIdExistsInUser(createExpenseDto.walletIdSelected,user);
    
    await this.walletsService.validateAmount(createExpenseDto.amount);

    await this.walletsService.canWithdraw(createExpenseDto.walletIdSelected,createExpenseDto.amount);

    // Iniciar una transacción
    const queryRunner = this.transferRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

   try {
      // Realizar la transacción de retiro
      const withdrawTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        createExpenseDto.amount*-1,
        "withdrawTransaction"
      );
      await this.transactionRepository.save(withdrawTransaction);

      const depositTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        0,
        "depositTransaction"
      );
      await this.transactionRepository.save(depositTransaction);

      const feeTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        createExpenseDto.fee* -1,
        "feeTransaction"
      );
      await this.transactionRepository.save(feeTransaction);

      const revenueTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        0,
        "revenueTransaction"
      );
      await this.transactionRepository.save(revenueTransaction);

      const transfer = this.transferRepository.create({
        status: 'expenses',
        deposit: depositTransaction,
        withdraw: withdrawTransaction,
        fromWallet: user.wallet,
        toWallet: user.wallet,
        revenue: revenueTransaction,
        fee: feeTransaction,
      });

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

  async allTransfers(user: User,paginationDto: PaginationDto) {
    try {
      const transfers = await this.transferRepository
      .createQueryBuilder('transfers')
      .leftJoinAndSelect('transfers.fromWallet', 'fromWallet')
      .leftJoinAndSelect('transfers.toWallet', 'toWallet')
      .leftJoinAndSelect('transfers.deposit', 'deposit')
      .leftJoinAndSelect('transfers.withdraw', 'withdraw')
      .leftJoinAndSelect('transfers.revenue', 'revenue')
      .leftJoinAndSelect('transfers.fee', 'fee')
      .orderBy('transfers.createDate', 'DESC') // Ordenar por fecha de creación descendente
      .skip(paginationDto.offset || 0)
      .take(paginationDto.limit || 10)
      .getMany();
  
      return transfers;
    } catch (error) {
      console.error('Error al obtener transferencias:', error);
      return [];
    }
  }

}
