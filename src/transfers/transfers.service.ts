import { BadRequestException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual, QueryRunner, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
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
  private readonly logger = new Logger('TransfersService');
  constructor(

    @Inject(WalletsService)
    private readonly walletsService: WalletsService,

    @InjectRepository(Rate)
    private readonly rateRepository: Repository<Rate>,

    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,

    private readonly dataSource: DataSource,
  ) { }
  // USER
  async createIncome(createIncomeDto: CreateIncomeDto, user: User) {
    let amountEntered = createIncomeDto.amount;
    let walletBalanceBefore = 0;
    let total = 0;
    let walletBalanceAfter = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log('amountEntered:', amountEntered);

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: createIncomeDto.walletIdSelected, user: { id: user.id }, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      walletBalanceBefore = wallet.balance;
      console.log('walletBalanceBefore:', walletBalanceBefore);

      if (createIncomeDto.rates) {
        total = this.calculateTotal(createIncomeDto.rates, amountEntered);
      } else {
        total = amountEntered;
      }
      console.log('Total:', total);
      walletBalanceAfter = walletBalanceBefore + total;
      console.log('walletBalanceAfter:', walletBalanceAfter);

      await queryRunner.manager.update(Wallet, createIncomeDto.walletIdSelected, { balance: walletBalanceAfter });

      let newRate = null;
      if (createIncomeDto.rates) {
        const rateCreate = queryRunner.manager.create(Rate, createIncomeDto.rates);
        newRate = await queryRunner.manager.save(Rate, rateCreate);
      }

      const transfer = queryRunner.manager.create(Transfer, {
        type: 'income',
        wallet: { id: createIncomeDto.walletIdSelected },
        toWallet: null,
        rates: newRate,
        amountEntered,
        walletBalanceBefore,
        total,
        walletBalanceAfter,
        category: { id: createIncomeDto.categoryIdSelected },
      });

      await queryRunner.manager.save(Transfer, transfer);

      await queryRunner.commitTransaction();
      return { message: 'Transferencia realizada con éxito', statusCode: HttpStatus.CREATED, transferId: transfer.id };
    } catch (error) {
      console.error('Error in createIncome:', error);
      await queryRunner.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al realizar la transferencia',
        );
      }
    } finally {
      await queryRunner.release();
    }
  }

  // transferWalletToWallet

  // USER
  async createExpense(createExpenseDto: CreateExpenseDto, user: User) {
    let amountEntered = createExpenseDto.amount;
    let walletBalanceBefore = 0;
    let total = 0;
    let walletBalanceAfter = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log('amountEntered:', amountEntered);

    try {
      if (createExpenseDto.rates) {
        total = this.calculateTotal(createExpenseDto.rates, amountEntered);
      } else {
        total = amountEntered;
      }
      console.log('Total', total);
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: createExpenseDto.walletId, user: { id: user.id }, isActive: true, balance: MoreThanOrEqual(total) },
        lock: { mode: 'pessimistic_read' },
      });
      if (!wallet.id) {
        throw new NotFoundException('Wallet not found');
      }
      walletBalanceBefore = wallet.balance;
      console.log('walletBalanceBefore:', walletBalanceBefore);

      walletBalanceAfter = walletBalanceBefore - total;
      console.log('walletBalanceAfter:', walletBalanceAfter);
      await queryRunner.manager.update(Wallet, createExpenseDto.walletId, { balance: walletBalanceAfter });


      let newRate = null;
      if (createExpenseDto.rates) {
        const rateCreate = queryRunner.manager.create(Rate, createExpenseDto.rates);
        newRate = await queryRunner.manager.save(Rate, rateCreate);
      }
      // Crear transferencia
      const transfer = queryRunner.manager.create(Transfer, {
        type: 'expense',
        wallet: { id: createExpenseDto.walletId },
        rates: newRate,
        amountEntered,
        walletBalanceBefore,
        total,
        walletBalanceAfter,
        category: { id: createExpenseDto.categoryId },
      });
      // Guardar transferencia
      await queryRunner.manager.save(Transfer, transfer);

      await queryRunner.commitTransaction();
      return { message: 'Transferencia realizada con éxito', statusCode: HttpStatus.CREATED, transferId: transfer.id };
    } catch (error) {
      this.logger.error('Error in createExpense');
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al realizar la transferencia';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al realizar la transferencia',
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
  // SYSTEM
  private calculateTotal(rateDto: RateDto[], amountEntered: number): number {
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
  // USER
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
        .andWhere('EXTRACT(MONTH FROM transfers.operationAt) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM transfers.operationAt) = :year', { year });

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
        .orderBy('transfers.operationAt', 'DESC')
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
  // USER
  async findOne(id: string) {
    try {
      const transfer = await this.transferRepository.findOne({ where: { id } });
      return transfer;
    } catch (error) {
      console.error('Error al obtener transferencia:', error);
      return {};
    }

  }
  // USER
  async getRates(user: User, paginationRateDto: PaginationRateDto) {
    const { limit, offset, month, year, walletId, type, subType } = paginationRateDto;
    console.log('paginationRateDto:', paginationRateDto);
    try {
      const totalValueQuery = this.rateRepository.createQueryBuilder('rates')
        .leftJoin('rates.transfer', 'transfer')
        .leftJoin('transfer.fromWallet', 'fromWallet')
        .leftJoin('transfer.toWallet', 'toWallet')
        .select('SUM(rates.value)', 'total')
        .andWhere('EXTRACT(MONTH FROM rates.createAt) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM rates.createAt) = :year', { year });

      if (walletId !== 'all') {
        totalValueQuery.andWhere('(fromWallet.id = :walletId OR toWallet.id = :walletId)', { walletId });
      }

      if (type) {
        totalValueQuery.andWhere('rates.type = :type', { type });
      }

      if (subType) {
        totalValueQuery.andWhere('rates.subType = :subType', { subType });
      }

      const totalValueResult = await totalValueQuery.getRawOne();

      // Consulta para obtener los detalles de las tasas con el ID de la transferencia
      const ratesQuery = this.rateRepository.createQueryBuilder('rates')
        .leftJoinAndSelect('rates.transfer', 'transfer')
        .leftJoinAndSelect('transfer.fromWallet', 'fromWallet')
        .leftJoinAndSelect('transfer.toWallet', 'toWallet')
        .andWhere('EXTRACT(MONTH FROM rates.createAt) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM rates.createAt) = :year', { year });

      if (walletId !== 'all') {
        ratesQuery.andWhere('(fromWallet.id = :walletId OR toWallet.id = :walletId)', { walletId });
      }

      if (type) {
        ratesQuery.andWhere('rates.type = :type', { type });
      }

      if (subType) {
        ratesQuery.andWhere('rates.subType = :subType', { subType });
      }

      ratesQuery.orderBy('rates.createAt', 'DESC')
        .skip(offset || 0)
        .take(limit || 10);

      const rates = await ratesQuery.getMany();

      return {
        statusCode: HttpStatus.OK,
        totalAmount: totalValueResult.total || 0,
        rates,
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
