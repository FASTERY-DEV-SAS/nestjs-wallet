import { Inject, Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-exprense.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { retry } from 'rxjs';
import { Wallet } from 'src/wallets/entities/wallet.entity';

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

    private readonly dataSource: DataSource,
  ) { }

  async transferWalletToWallet(
    createTransferDto: CreateTransferDto, user: User
  ) {
    await this.walletsService.validateAmount(createTransferDto.amount);

    const fromWallet = await this.walletsService.getWalletOne(createTransferDto.fromWalletId);

    await this.walletsService.containsBalance(fromWallet, createTransferDto.amount);

    const toWallet = await this.walletsService.getWalletOne(createTransferDto.toWalletId);

    // Iniciar una transacción
    const queryRunner = this.transferRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Realizar la transacción de retiro
      // FIX: USAR new Transaction();
      // const withdrawTransaction = await this.transactionsService.createNewTransaction(
      //   createTransferDto.fromWalletId,
      //   createTransferDto.amount * -1,
      //   "withdrawTransaction",
      //   "withdraw",
      // );
      const withdrawTransaction = await this.transactionsService.createNewTransaction(
        createTransferDto.fromWalletId,
        createTransferDto.amount * -1,
        "withdrawTransaction",
        "withdraw",
      );
      await this.transactionRepository.save(withdrawTransaction);

      const depositTransaction = await this.transactionsService.createNewTransaction(
        createTransferDto.toWalletId,
        createTransferDto.amount,
        "depositTransaction",
        "deposit"
      );
      await this.transactionRepository.save(depositTransaction);

      const feeTransaction = await this.transactionsService.createNewTransaction(
        createTransferDto.fromWalletId,
        createTransferDto.fee * -1,
        "feeTransaction",
        "fee"
      );
      await this.transactionRepository.save(feeTransaction);

      const revenueTransaction = await this.transactionsService.createNewTransaction(
        createTransferDto.fromWalletId,
        createTransferDto.revenue,
        "revenueTransaction",
        "revenue"
      );
      await this.transactionRepository.save(revenueTransaction);

      // const previousBalance = +fromWallet.balance - +createTransferDto.amount;

      const transfer = this.transferRepository.create({
        type: 'transfer',
        deposit: depositTransaction,
        withdraw: withdrawTransaction,
        fromWallet: fromWallet,
        toWallet: toWallet,
        revenue: revenueTransaction,
        fee: feeTransaction,
        // previous_balance: previousBalance
      });

      // Actualizar los saldos de las billeteras 
      // FIXME: Crear otro endpoint para actualizar el saldo de la billetera

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

  async createIncome(createIncomeDto: CreateIncomeDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Validar si la cartera existe para el usuario
      await this.walletsService.walletIdExistsInUser(createIncomeDto.walletIdSelected, user);

      // Validar el monto del ingreso
      this.walletsService.validateAmount(createIncomeDto.amount);

      // Obtener la cartera desde la base de datos
      const fromWallet = await this.walletsService.getWalletOne(createIncomeDto.walletIdSelected);

      // Crear las transacciones
      const transactionData = [
        { amount: 0, meta: { description: 'No description' }, type: "withdraw" },
        { amount: createIncomeDto.amount, meta: createIncomeDto.meta, type: "deposit" },
        { amount: createIncomeDto.fee * -1, meta: createIncomeDto.feeMeta, type: "fee" },
        { amount: 0, meta: { description: 'No description' }, type: "revenue" }
      ];

      const transactions = await Promise.all(transactionData.map(async transaction =>
        this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, transaction.amount, transaction.meta, transaction.type)
      ));

      // Guardar las transacciones en la base de datos
      await queryRunner.manager.save(Transaction, transactions);

      // Actualizar el saldo de la cartera
      const previousBalance = +fromWallet.balance + +createIncomeDto.amount;
      fromWallet.balance = previousBalance;
      await queryRunner.manager.save(Wallet, fromWallet);

      // Crear el objeto Transfer
      const transfer = this.transferRepository.create({
        type: 'income',
        deposit: transactions[1],
        withdraw: transactions[0],
        fromWallet: fromWallet,
        toWallet: null,
        revenue: transactions[3],
        fee: transactions[2],
        category: { id: createIncomeDto.categoryIdSelected },
        previous_balance: previousBalance
      });

      // Guardar el objeto Transfer en la base de datos
      await queryRunner.manager.save(Transfer, transfer);

      // Confirmar la transacción
      await queryRunner.commitTransaction();

      return { message: 'Transferencia realizada con éxito', status: true };
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      console.error(error);
      return { message: 'Error al realizar la transferencia', status: false };
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async createExpense(createExpenseDto: CreateExpenseDto, user: User) {

    await this.walletsService.walletIdExistsInUser(createExpenseDto.walletIdSelected, user);

    const fromWallet = await this.walletsService.getWalletOne(createExpenseDto.walletIdSelected);

    await this.walletsService.validateAmount(createExpenseDto.amount);

    await this.walletsService.canWithdraw(createExpenseDto.walletIdSelected, createExpenseDto.amount);

    // Iniciar una transacción
    const queryRunner = this.transferRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Realizar la transacción de retiro
      const withdrawTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        createExpenseDto.amount * -1,
        "withdrawTransaction",
        "withdraw"
      );
      await this.transactionRepository.save(withdrawTransaction);

      const depositTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        0,
        "depositTransaction",
        "deposit"
      );
      await this.transactionRepository.save(depositTransaction);

      const feeTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        createExpenseDto.fee * -1,
        "feeTransaction",
        "fee"
      );
      await this.transactionRepository.save(feeTransaction);

      const revenueTransaction = await this.transactionsService.createNewTransaction(
        createExpenseDto.walletIdSelected,
        0,
        "revenueTransaction",
        "revenue"
      );
      await this.transactionRepository.save(revenueTransaction);

      const previousBalance = +fromWallet.balance - +createExpenseDto.amount;

      const transfer = this.transferRepository.create({
        type: 'expense',
        deposit: depositTransaction,
        withdraw: withdrawTransaction,
        fromWallet: fromWallet,
        toWallet: fromWallet,
        revenue: revenueTransaction,
        fee: feeTransaction,
        category: { id: createExpenseDto.categoryIdSelected },
        previous_balance: previousBalance
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

  async allTransfers(user: User, paginationDto: PaginationDto) {
    try {
      const month = parseInt(paginationDto.month, 10);
      const year = parseInt(paginationDto.year, 10);

      if (isNaN(month) || isNaN(year)) {
        throw new Error('Mes o año no válidos');
      }

      const queryBuilder = this.transferRepository
        .createQueryBuilder('transfers')
        .leftJoinAndSelect('transfers.fromWallet', 'fromWallet')
        .leftJoinAndSelect('transfers.toWallet', 'toWallet')
        .leftJoinAndSelect('transfers.deposit', 'deposit')
        .leftJoinAndSelect('transfers.withdraw', 'withdraw')
        .leftJoinAndSelect('transfers.revenue', 'revenue')
        .leftJoinAndSelect('transfers.fee', 'fee')
        .leftJoinAndSelect('transfers.category', 'category')
        .where('fromWallet.user = :userId', { userId: user.id })
        .andWhere('EXTRACT(MONTH FROM transfers.operationDate) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM transfers.operationDate) = :year', { year });

      if (paginationDto.walletId) {
        queryBuilder.andWhere('(fromWallet.id = :walletId OR toWallet.id = :walletId)', { walletId: paginationDto.walletId });
      }

      if (paginationDto.categoryId) {
        queryBuilder.andWhere('category.id = :categoryId', { categoryId: paginationDto.categoryId });
      }

      if (paginationDto.type) {
        queryBuilder.andWhere('transfers.type = :type', { type: paginationDto.type });
      }

      if (paginationDto.search) {
        queryBuilder.andWhere('(transfers.meta::text ILIKE :search OR transfers.status ILIKE :search)', { search: `%${paginationDto.search}%` });
      }

      const transfers = await queryBuilder
        .orderBy('transfers.operationDate', 'DESC')
        .skip(paginationDto.offset || 0)
        .take(paginationDto.limit || 10)
        .getMany();

      if (transfers.length === 0) {
        return [];
      }

      return transfers;
    } catch (error) {
      console.error('Error al obtener transferencias:', error.message);
      throw new Error('Error al obtener transferencias');
    } finally {
      // Puedes realizar acciones de limpieza o manejo de recursos aquí si es necesario
    }
  }


  async findOne(id: string) {
    try {
      const transfer = await this.transferRepository.findOne({ where: { id } });
      return transfer;
    } catch (error) {
      console.error('Error al obtener transferencia:', error);
      return {};
    }

  }

}
