import { BadRequestException, HttpStatus, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { RateDto } from './dto/rate.dto';
import { Rate } from './entities/rate.entity';
import { PaginationRateDto } from './dto/pagination-rate.dto';

@Injectable()
export class TransfersService {
  constructor(
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,

    @Inject(WalletsService)
    private readonly walletsService: WalletsService,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Rate)
    private readonly rateRepository: Repository<Rate>,

    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,

    private readonly dataSource: DataSource,
  ) { }

  async createIncome(createIncomeDto: CreateIncomeDto, user: User) {
    const { amount, walletIdSelected, rates, categoryIdSelected, meta } = createIncomeDto;
    let amountEntered = createIncomeDto.amount;
    let walletBalanceBefore = 0;
    let total = 0;
    let walletBalanceAfter = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet55 = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletIdSelected },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet55) {
        throw new BadRequestException('Wallet not found');
      }
      console.log('wallet55:', wallet55);
      const wallet1 = await this.walletsService.canWithdraw(createIncomeDto.walletIdSelected, 0, user) as Wallet;
      walletBalanceBefore = wallet1.balance;
      console.log('amountEntered:', amountEntered);
      console.log('walletBalanceBefore:', walletBalanceBefore);

      if (rates) {
        total = this.calculateTotal(rates, amountEntered);
      } else {
        total = amountEntered;
      }
      console.log('Total', total);
      walletBalanceAfter = walletBalanceBefore + total;
      console.log('walletBalanceAfter:', walletBalanceAfter);



      // Actualizar el saldo de la cartera
      await this.updateWalletBalance(queryRunner, createIncomeDto.walletIdSelected, walletBalanceAfter);

      // Crear las transacciones en paralelo
      const transactionPromises = [
        this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, total, createIncomeDto.meta, "deposit"),
      ];

      const transactionData = await Promise.all(transactionPromises);

      // Guardar las transacciones en la base de datos
      await queryRunner.manager.save(Transaction, transactionData);
      let newRate = null;
      if (rates) {
        const rateCreate = this.rateRepository.create(rates);
        newRate = await this.rateRepository.save(rateCreate);
      } else {
        newRate = null;
      }

      // Crear el objeto Transfer
      const transfer = this.transferRepository.create({
        type: 'income',
        transactions: transactionData,
        fromWallet: { id: createIncomeDto.walletIdSelected } as Wallet,
        toWallet: null,
        rates: newRate,
        amountEntered,
        walletBalanceBefore,
        total,
        walletBalanceAfter,
        category: { id: createIncomeDto.categoryIdSelected },
      });

      // Guardar el objeto Transfer en la base de datos
      await queryRunner.manager.save(Transfer, transfer);

      // Confirmar la transacción
      await queryRunner.commitTransaction();
      // return transfer;
      // console.log('transfer:', transfer);
      return { message: 'Transferencia realizada con éxito', statusCode: HttpStatus.CREATED, transferId: transfer.id };
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ocurrió un error al realizar la transferencia',
        );
      }
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async transferWalletToWallet(createTransferDto: CreateTransferDto, user: User) {
    try {
      // Validar la cantidad de la transferencia

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
          )
        ];

        const transactionData = await Promise.all(transactionsCreationPromises);

        // Guardar las transacciones en la base de datos
        await queryRunner.manager.save(Transaction, transactionData);

        // Crear el objeto Transfer
        const transfer = this.transferRepository.create({
          type: 'transfer',
          transactions: transactionData,
          fromWallet: fromWallet,
          toWallet: toWallet,
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

  async createExpense(createExpenseDto: CreateExpenseDto, user: User) {
    const { amount, walletIdSelected, rates, categoryIdSelected, meta } = createExpenseDto;
    let amountEntered = amount;
    let walletBalanceBefore = 0;
    let total = 0;
    let walletBalanceAfter = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet55 = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletIdSelected },
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet55) {
        throw new BadRequestException('Wallet not found');
      }
      const wallet1 = await this.walletsService.canWithdraw(walletIdSelected, amount, user) as Wallet;
      walletBalanceBefore = wallet1.balance;
      console.log('amountEntered:', amountEntered);
      console.log('walletBalanceBefore:', walletBalanceBefore);

      if (rates) {
        total = this.calculateTotal(rates, amountEntered);
      } else {
        total = amountEntered;
      }

      console.log('Total', total);
      walletBalanceAfter = walletBalanceBefore - total;
      console.log('walletBalanceAfter:', walletBalanceAfter);

      // Actualizar saldo de la cartera
      await this.updateWalletBalance(queryRunner, createExpenseDto.walletIdSelected, walletBalanceAfter);

      // Crear transacciones en paralelo
      const transactionPromises = [
        this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, total, createExpenseDto.meta, "withdraw"),
        // this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, 0, { description: 'No description' }, "deposit"),
      ];

      const transactionData = await Promise.all(transactionPromises);

      // Guardar transacciones
      await queryRunner.manager.save(Transaction, transactionData);
      let newRate = null;
      if (rates) {
        const rateCreate = this.rateRepository.create(rates);
        newRate = await this.rateRepository.save(rateCreate);
      } else {
        newRate = null;
      }

      // Crear transferencia
      const transfer = this.transferRepository.create({
        type: 'expense',
        transactions: transactionData,
        fromWallet: { id: createExpenseDto.walletIdSelected },
        toWallet: null,
        rates: newRate,
        amountEntered,
        walletBalanceBefore,
        total,
        walletBalanceAfter,
        category: { id: createExpenseDto.categoryIdSelected },
        // FIXME: Solo debe ser caregorias de gastos
      });

      // Guardar transferencia
      await queryRunner.manager.save(Transfer, transfer);


      // Confirmar transacción
      await queryRunner.commitTransaction();
      // return transfer;
      // console.log('transfer:', transfer);
      return { message: 'Transferencia realizada con éxito', statusCode: HttpStatus.CREATED, transferId: transfer.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ocurrió un error al realizar la transferencia',
        );
      }
    } finally {
      // Liberar recursos
      await queryRunner.release();
    }
  }

  calculateTotal(rateDto: RateDto[], amountEntered: number): number {
    let total = amountEntered;

    rateDto.forEach(transaction => {
      let transactionAmount = transaction.value;

      if (transaction.typeRate === "percentage") {
        transactionAmount = (transaction.value / 10000) * amountEntered;
        // 1=0.01% 100=1% 1000=10% 10000=100%
      }

      if (transaction.incomeExpenseType === "income") {
        total += transactionAmount;
      } else if (transaction.incomeExpenseType === "expense") {
        total -= transactionAmount;
      }
      // console.log('total:', total);
    });
    return total;
  }

  async updateWalletBalance(queryRunner: QueryRunner, walletId: string, newBalance: number) {
    await queryRunner.manager.update(Wallet, walletId, { balance: newBalance });
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
        // .leftJoinAndSelect('transfers.transactions', 'transactions',{type: 'deposit'})
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

  async showRates(user: User, paginationRateDto: PaginationRateDto) {
    const { limit, offset, month, year, walletId, type, subType } = paginationRateDto;
    try {
      // Consulta para obtener la suma de los valores
      const totalValueQuery = this.rateRepository.createQueryBuilder('rates')
        .leftJoin('rates.transfer', 'transfer')
        .leftJoin('transfer.fromWallet', 'fromWallet')
        .leftJoin('transfer.toWallet', 'toWallet')
        .select('SUM(rates.value)', 'total')
        .andWhere('EXTRACT(MONTH FROM rates.createAt) = :month', { month: parseInt(month) })
        .andWhere('EXTRACT(YEAR FROM rates.createAt) = :year', { year: parseInt(year) })
        .andWhere('(fromWallet.id = :walletId OR toWallet.id = :walletId)', { walletId });

      if (type) {
        totalValueQuery.andWhere('rates.type = :type', { type });
      }

      if (subType) {
        totalValueQuery.andWhere('rates.subType = :subType', { subType });
      }


      const totalValueResult = await totalValueQuery.getRawOne();

      // Consulta para obtener los detalles de las tasas con el ID de la transferencia
      const ratesQuery = this.rateRepository.createQueryBuilder('rates')
        .leftJoin('rates.transfer', 'transfer')
        .leftJoin('transfer.fromWallet', 'fromWallet')
        .leftJoin('transfer.toWallet', 'toWallet')
        .select(['rates', 'transfer.id']) // Seleccionar 'rates' y 'transfer.id'
        .andWhere('EXTRACT(MONTH FROM rates.createAt) = :month', { month: parseInt(month) })
        .andWhere('EXTRACT(YEAR FROM rates.createAt) = :year', { year: parseInt(year) })
        .andWhere('(fromWallet.id = :walletId OR toWallet.id = :walletId)', { walletId })
        .orderBy('rates.createAt', 'DESC')
        .skip(offset || 0)
        .take(limit || 10); // Agregar valor predeterminado para limit

      if (type) {
        ratesQuery.andWhere('rates.type = :type', { type });
      }

      if (subType) {
        ratesQuery.andWhere('rates.subType = :subType', { subType });
      }

      const rates = await ratesQuery.getMany();

      return {
        statusCode: HttpStatus.OK,
        totalAmount: totalValueResult.total || 0,
        rates: rates.map(rate => ({
          ...rate,
          transferId: rate.transfer.id
        })),
        message: 'Tasas obtenidas con éxito'
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener tasas',
        error: error.message,
      };
    }
  }

}
