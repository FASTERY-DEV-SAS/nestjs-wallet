import { BadRequestException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { User } from 'src/auth/entities/user.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-exprense.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { RateDto } from './dto/rate.dto';
import { Rate } from './entities/rate.entity';
import { PaginationRateDto } from './dto/pagination-rate.dto';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger('TransfersService');
  constructor(

    @InjectRepository(Rate)
    private readonly rateRepository: Repository<Rate>,

    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,

    private readonly dataSource: DataSource,
  ) { }
  // USER++
  async createIncome(createIncomeDto: CreateIncomeDto, user: User) {
    let amountEntered = createIncomeDto.amount || 0;
    let walletBalanceBefore = 0;
    let total = 0;
    let walletBalanceAfter = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log('amountEntered:', amountEntered);

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: createIncomeDto.walletId, user: { id: user.id }, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Billetera no encontrada o no cumple con los requisitos');
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

      await queryRunner.manager.update(Wallet, createIncomeDto.walletId, { balance: walletBalanceAfter });

      let newRate = null;
      if (createIncomeDto.rates) {
        const rateCreate = queryRunner.manager.create(Rate, createIncomeDto.rates);
        newRate = await queryRunner.manager.save(Rate, rateCreate);
      }

      const transfer = queryRunner.manager.create(Transfer, {
        type: 'income',
        wallet: { id: createIncomeDto.walletId },
        toWallet: null,
        rates: newRate,
        amountEntered,
        walletBalanceBefore,
        total,
        walletBalanceAfter,
        category: { id: createIncomeDto.categoryId },
      });

      await queryRunner.manager.save(Transfer, transfer);

      await queryRunner.commitTransaction();
      return { message: 'Transferencia realizada con éxito', statusCode: HttpStatus.CREATED, transferId: transfer.id };
    } catch (error) {
      console.error('Error in createIncome:', error.stack);
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

  // USER++
  async createExpense(createExpenseDto: CreateExpenseDto, user: User) {
    let amountEntered = createExpenseDto.amount || 0;
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
        lock: { mode: 'pessimistic_write' },
      });
      if (!wallet) {
        throw new NotFoundException('Billtera no encontrada o no tiene los recursos suficientes');
      }

      if (total > wallet.balance) {
        throw new BadRequestException('El monto de la transferencia supera el saldo de la billetera');
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
  // USER+
  async getTransfers(user: User, paginationDto: PaginationDto) {
    try {
      const month = paginationDto.month;
      const year = paginationDto.year;

      if (isNaN(month) || isNaN(year)) {
        throw new Error('Mes o año no válidos');
      }

      const baseQuery = this.transferRepository
        .createQueryBuilder('transfers')
        .leftJoinAndSelect('transfers.wallet', 'wallet')
        .leftJoinAndSelect('transfers.category', 'category')
        .leftJoinAndSelect('transfers.rates', 'rates')
        .where('wallet.user = :userId', { userId: user.id })
        .andWhere('EXTRACT(MONTH FROM transfers.operationAt) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM transfers.operationAt) = :year', { year });

      if (paginationDto.walletId) {
        baseQuery.andWhere('wallet.id = :walletId', { walletId: paginationDto.walletId });
      }

      if (paginationDto.categoryId) {
        baseQuery.andWhere('category.id = :categoryId', { categoryId: paginationDto.categoryId });
      }

      if (paginationDto.type) {
        baseQuery.andWhere('transfers.type = :type', { type: paginationDto.type });
      }

      if (paginationDto.search) {
        baseQuery.andWhere('(transfers.meta::text ILIKE :search OR transfers.status ILIKE :search)', { search: `%${paginationDto.search}%` });
      }

      // Consulta para obtener las transferencias con paginación
      const transfers = await baseQuery
        .orderBy('transfers.operationAt', 'DESC')
        .skip(paginationDto.offset || 0)
        .take(paginationDto.limit)
        .getMany();

      // Consulta para obtener la suma total ajustada para tipos 'income' y 'expense'
      const totalSumQuery = this.transferRepository
        .createQueryBuilder('transfers')
        .leftJoinAndSelect('transfers.category', 'category')
        .select(
          "SUM(CASE WHEN transfers.type = 'income' THEN transfers.total WHEN transfers.type = 'expense' THEN -transfers.total ELSE 0 END)",
          'sum'
        )
        .leftJoin('transfers.wallet', 'wallet')
        .where('wallet.user = :userId', { userId: user.id })
        .andWhere('EXTRACT(MONTH FROM transfers.operationAt) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM transfers.operationAt) = :year', { year });

      if (paginationDto.walletId) {
        totalSumQuery.andWhere('wallet.id = :walletId', { walletId: paginationDto.walletId });
      }

      if (paginationDto.categoryId) {
        totalSumQuery.andWhere('category.id = :categoryId', { categoryId: paginationDto.categoryId });
      }

      if (paginationDto.type) {
        totalSumQuery.andWhere('transfers.type = :type', { type: paginationDto.type });
      }

      if (paginationDto.search) {
        totalSumQuery.andWhere('(transfers.meta::text ILIKE :search OR transfers.status ILIKE :search)', { search: `%${paginationDto.search}%` });
      }

      const totalSumResult = await totalSumQuery.getRawOne();
      const totalSum = totalSumResult ? Number(totalSumResult.sum) : 0;

      return {
        statusCode: HttpStatus.OK,
        message: 'Transferencias obtenidas con éxito',
        transfers,
        balance: totalSum,
      };
    } catch (error) {
      console.error('Error al obtener transferencias:', error.message);
      throw new Error('Error al obtener transferencias');
    }
  }
  // USER++
  async getTransfer(id: string, user: User) {
    try {
      const transfer = await this.transferRepository.findOne({
        where: {
          id: id,
        },
        relations: ['wallet', 'category', 'rates', 'wallet.user'],
      });
      if (!transfer) {
        throw new BadRequestException('Transferencia no encontrada');
      }

      if (transfer.wallet.user.id !== user.id) {
        throw new BadRequestException('Transferencia no pertenece al usuario');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Transferencia obtenida con éxito',
        transfer,
      };
    } catch (error) {
      this.logger.error(`Error in getTransfer`, error.stack);
      if (error instanceof BadRequestException) {
        throw new BadRequestException(
          error.message || 'Ocurrió un error al realizar la transferencia',
        );
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al realizar la transferencia',
        );
      }
    }
  }
  // USER+
  async getRates(user: User, paginationRateDto: PaginationRateDto) {
    console.log('paginationRateDto:', paginationRateDto);
    const { limit, offset, month, year, walletId, type, subType, search } = paginationRateDto;
    try {
      const totalValueQuery = this.rateRepository.createQueryBuilder('rates')
        .leftJoin('rates.transfer', 'transfer')
        .leftJoin('transfer.wallet', 'wallet')
        .select('SUM(rates.value)', 'total')
        .where('wallet.userId = :userId', { userId: user.id });

      if (month) {
        totalValueQuery.andWhere('EXTRACT(MONTH FROM transfer.operationAt) = :month', { month });
      }

      if (year) {
        totalValueQuery.andWhere('EXTRACT(YEAR FROM transfer.operationAt) = :year', { year });
      }

      if (walletId && walletId !== 'all') {
        totalValueQuery.andWhere('wallet.id = :walletId', { walletId });
      }

      if (type) {
        totalValueQuery.andWhere('rates.type = :type', { type });
      }

      if (subType) {
        totalValueQuery.andWhere('rates.subType = :subType', { subType });
      }

      if (search) {
        totalValueQuery.andWhere('CAST(rates.meta AS TEXT) LIKE :search', { search: `%${search}%` });
      }

      const totalValueResult = await totalValueQuery.getRawOne();

      const ratesQuery = this.rateRepository.createQueryBuilder('rates')
        .leftJoinAndSelect('rates.transfer', 'transfer')
        .leftJoinAndSelect('transfer.wallet', 'wallet')
        .where('wallet.userId = :userId', { userId: user.id });

      if (month) {
        ratesQuery.andWhere('EXTRACT(MONTH FROM transfer.operationAt) = :month', { month });
      }

      if (year) {
        ratesQuery.andWhere('EXTRACT(YEAR FROM transfer.operationAt) = :year', { year });
      }

      if (walletId && walletId !== 'all') {
        ratesQuery.andWhere('wallet.id = :walletId', { walletId });
      }

      if (type) {
        ratesQuery.andWhere('rates.type = :type', { type });
      }

      if (subType) {
        ratesQuery.andWhere('rates.subType = :subType', { subType });
      }

      if (search) {
        ratesQuery.andWhere('CAST(rates.meta AS TEXT) LIKE :search', { search: `%${search}%` });
      }

      ratesQuery.orderBy('rates.createAt', 'DESC')
        .skip(offset || 0)
        .take(limit || 250);

      const rates = await ratesQuery.getMany();

      return {
        statusCode: HttpStatus.OK,
        message: 'Tasas obtenidas con éxito',
        balance: totalValueResult?.total || 0,
        rates,
      };
    } catch (error) {
      this.logger.error(`Error in getRates`, error.stack);
      if (error instanceof BadRequestException) {
        throw new BadRequestException(
          error.message || 'Ocurrió un error al obtener las tasas',
        );
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al obtener las tasas',
        );
      }
    }
  }


}
