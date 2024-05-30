import { Inject, Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-exprense.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { retry } from 'rxjs';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';

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

  async transferWalletToWallet(createTransferDto: CreateTransferDto, user: User) {
    try {
      // Validar la cantidad de la transferencia
      await this.walletsService.validateAmount(createTransferDto.amount);

      // Obtener la billetera de origen
      const fromWallet = await this.walletsService.getWalletOne(createTransferDto.fromWalletId);

      // Verificar que la billetera de origen tenga suficiente saldo para la transferencia
      await this.walletsService.containsBalance(fromWallet, createTransferDto.amount);

      // Obtener la billetera de destino
      const toWallet = await this.walletsService.getWalletOne(createTransferDto.toWalletId);

      // Iniciar una transacción
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {

        const processedBalancefromWallet = +fromWallet.balance - +createTransferDto.amount - +createTransferDto.fee + +createTransferDto.revenue;
        console.log('previousBalance:', processedBalancefromWallet);

        // Actualizar el saldo de la cartera
        await this.updateWalletBalance(queryRunner, fromWallet.id, processedBalancefromWallet);

        const processedBalancetoWallet = +toWallet.balance + +createTransferDto.amount;
        console.log('previousBalance:', processedBalancetoWallet);

        await this.updateWalletBalance(queryRunner, toWallet.id, processedBalancetoWallet);


        // Crear todas las transacciones de forma paralela
        const transactionsCreationPromises = [
          this.transactionsService.createNewTransaction(
            createTransferDto.fromWalletId,
            createTransferDto.amount * -1,
            "withdrawTransaction",
            "withdraw"
          ),
          this.transactionsService.createNewTransaction(
            createTransferDto.toWalletId,
            createTransferDto.amount,
            "depositTransaction",
            "deposit"
          ),
          this.transactionsService.createNewTransaction(
            createTransferDto.fromWalletId,
            createTransferDto.fee * -1,
            "feeTransaction",
            "fee"
          ),
          this.transactionsService.createNewTransaction(
            createTransferDto.fromWalletId,
            createTransferDto.revenue,
            "revenueTransaction",
            "revenue"
          )
        ];

        const transactionData = await Promise.all(transactionsCreationPromises);

        // Guardar las transacciones en la base de datos
        await queryRunner.manager.save(Transaction, transactionData);

        // Crear el objeto Transfer
        const transfer = this.transferRepository.create({
          type: 'transfer',
          deposit: transactionData[1],
          withdraw: transactionData[0],
          fromWallet: fromWallet,
          toWallet: toWallet,
          revenue: transactionData[3],
          fee: transactionData[2],
        });

        // Guardar la transferencia en la base de datos
        await queryRunner.manager.save(Transfer, transfer);

        // Confirmar la transacción
        await queryRunner.commitTransaction();

        // Devolver mensaje de éxito
        return { message: 'Transferencia realizada con éxito', status: true, transferId: transfer.id };
      } catch (error) {
        // Revertir la transacción en caso de error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Liberar recursos
        await queryRunner.release();
      }
    } catch (error) {
      // Devolver mensaje de error
      return { message: 'Error al realizar la transferencia', status: false };
    }
  }

  async createIncome(createIncomeDto: CreateIncomeDto, user: User): Promise<any> {
    if (createIncomeDto.fee === undefined) {
      createIncomeDto.fee = 0;
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar el monto del ingreso
      this.walletsService.validateAmount(createIncomeDto.amount);

      // Validar si la cartera existe para el usuario
      await this.walletsService.walletIdExistsInUser(createIncomeDto.walletIdSelected, user);

      // Obtener la cartera desde la base de datos
      const fromWallet = await this.walletsService.getWalletOne(createIncomeDto.walletIdSelected);
      console.log('fromWallet:', fromWallet.balance);

      // Calcular saldo previo
      const processedBalance = +fromWallet.balance + +createIncomeDto.amount - +createIncomeDto.fee;
      console.log('previousBalance:', processedBalance);

      // Actualizar el saldo de la cartera
      await this.updateWalletBalance(queryRunner, createIncomeDto.walletIdSelected, processedBalance);

      // Crear las transacciones en paralelo
      const transactionPromises = [
        this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, 0, { description: 'No description' }, "withdraw"),
        this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, createIncomeDto.amount, createIncomeDto.meta, "deposit"),
        this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, createIncomeDto.fee * -1, createIncomeDto.feeMeta, "fee"),
        this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, 0, { description: 'No description' }, "revenue")
      ];

      const transactionData = await Promise.all(transactionPromises);

      // Guardar las transacciones en la base de datos
      await queryRunner.manager.save(Transaction, transactionData);

      // Crear el objeto Transfer
      const transfer = this.transferRepository.create({
        type: 'income',
        deposit: transactionData[1],
        withdraw: transactionData[0],
        fromWallet: { id: createIncomeDto.walletIdSelected } as Wallet,
        toWallet: null,
        revenue: transactionData[3],
        fee: transactionData[2],
        category: { id: createIncomeDto.categoryIdSelected },
        processed_balance: processedBalance
      });

      // Guardar el objeto Transfer en la base de datos
      await queryRunner.manager.save(Transfer, transfer);

      // Confirmar la transacción
      await queryRunner.commitTransaction();
      return { message: 'Transferencia realizada con éxito', status: true, transferId: transfer.id };
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

  async updateWalletBalance(queryRunner: QueryRunner, walletId: string, newBalance: number) {
    await queryRunner.manager.update(Wallet, walletId, { balance: newBalance });
  }

  async createExpense(createExpenseDto: CreateExpenseDto, user: User) {
    if (createExpenseDto.fee === undefined) {
      createExpenseDto.fee = 0;
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validaciones
      await Promise.all([
        this.walletsService.validateAmount(createExpenseDto.amount),
        // this.walletsService.walletIdExistsInUser(createExpenseDto.walletIdSelected, user),
        this.walletsService.canWithdraw(createExpenseDto.walletIdSelected, createExpenseDto.amount)
      ]);

      // Obtener la cartera desde la base de datos
      const fromWallet = await this.walletsService.getWalletOne(createExpenseDto.walletIdSelected);
      console.log('fromWallet:', fromWallet.balance);

      // Calcular saldo previo
      const processedBalance = +fromWallet.balance - +createExpenseDto.amount - +createExpenseDto.fee;
      console.log('previousBalance:', processedBalance);

      // Actualizar saldo de la cartera
      await this.updateWalletBalance(queryRunner, createExpenseDto.walletIdSelected, processedBalance);

      // Crear transacciones en paralelo
      const transactionPromises = [
        this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, createExpenseDto.amount * -1, createExpenseDto.meta, "withdraw"),
        this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, 0, { description: 'No description' }, "deposit"),
        this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, createExpenseDto.fee * -1, { description: 'No description' }, "fee"),
        this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, 0, { description: 'No description' }, "revenue")
      ];

      const transactionData = await Promise.all(transactionPromises);

      // Guardar transacciones
      await queryRunner.manager.save(Transaction, transactionData);

      // Crear transferencia
      const transfer = this.transferRepository.create({
        type: 'expense',
        deposit: transactionData[1],
        withdraw: transactionData[0],
        fromWallet: { id: createExpenseDto.walletIdSelected } as Wallet,
        toWallet: null,
        revenue: transactionData[3],
        fee: transactionData[2],
        category: { id: createExpenseDto.categoryIdSelected },
        processed_balance: processedBalance
      });

      // Guardar transferencia
      await queryRunner.manager.save(Transfer, transfer);

      // Confirmar transacción
      await queryRunner.commitTransaction();
      return { message: 'Transferencia realizada con éxito', status: true, transferId: transfer.id };
    } catch (error) {
      // Revertir transacción en caso de error
      await queryRunner.rollbackTransaction();
      console.error(error);
      return { message: 'Error al realizar la transferencia', status: false };
    } finally {
      // Liberar recursos
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
        .take(paginationDto.limit)
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
