import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);
  private walletExistenceCache: Map<string, boolean> = new Map();

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) { }
  // USER
  async createWallet(createWalletDto: CreateWalletDto, user: User): Promise<{
    statusCode: number;
    message: string;
    walletId: string;
  }> {
    try {
      const { ...walletDetails } = createWalletDto;

      const newwallet = this.walletRepository.create({
        ...walletDetails,
        user,
      });

      const saveOperation = this.walletRepository.save(newwallet);

      await Promise.all([saveOperation]);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Billetera creada con éxito',
        walletId: newwallet.id,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ocurrió un error al crear la billetera',
        );
      }
    }
  }

  async updateWallet(id: string, updateWalletDto: UpdateWalletDto): Promise<{
    statusCode: number;
    message: string;
    walletId: string;
  }> {
    try {
      const updateOperation = this.walletRepository.update(id, updateWalletDto);
      await Promise.all([updateOperation]);
      return {
        statusCode: HttpStatus.OK,
        message: 'Billetera actualizada con éxito',
        walletId: id
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ocurrió un error al crear la billetera',
        );
      }
    }
  }

  async getOneWallet(walletId: string, user: User) {
    try {
      const wallet = await this.walletRepository.findOne({ where: { id: walletId, user: { id: user.id }, isActive: true } });
      if (wallet) {
        return wallet;
      } else {
        return { message: 'La billetera no existe', statusCode: HttpStatus.NOT_FOUND };
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ocurrió un error al obtener la billetera',
        );
      }
    }

  }

  async getTotalAmountOfWallets(user: User) {
    let overallBalance = 0;
    try {
      const wallets = await this.walletRepository.find({
        where: { user: { id: user.id }, isActive: true },
      });

      wallets.forEach((wallet) => {
        overallBalance += wallet.balance;
      });

      return {
        statusCode: HttpStatus.OK,
        total: overallBalance,
        message: 'Balance general de las billeteras',

      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ocurrió un error al obtener el balance general de las billeteras',
        );
      }
    }
  }

  async showWallets(user: User): Promise<Wallet[]> {
    try {
      return await this.walletRepository.find({
        where: { user: { id: user.id }, isActive: true },
        order: {
          createDate: "ASC"
        }
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ocurrió un error al obtener las billeteras del usuario',
        );
      }
    }

  }

  // SYSTEM
  async getWalletOne(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOneOrFail({
        where: { id: walletId },
        relations: ['transactions']
      });
      return {
        ...wallet,

      };
    } catch (error) {
      if (error.name === 'EntityNotFound') {
        throw new NotFoundException('Wallet not found');
      } else {
        throw new Error('Error fetching wallet');
      }
    }
  }
  async canWithdraw(walletId: string, amount: number, user: User): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: {
          id: walletId,
          user: { id: user.id },
          isActive: true,
          balance: MoreThanOrEqual(amount)
        }
      });
      if (!wallet) {
        throw new BadRequestException('La billetera no cumple con los requisitos para realizar la transacción');
      }
      return wallet;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'La billetera no cumple con los requisitos para realizar la transacción',
        );
      }
    }
  }

  // SUPPORT IT
  async updateWalletBalance(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOneOrFail({
        where: { id: walletId },
        relations: ['transactions'],
      });

      const result = await this.walletRepository
        .createQueryBuilder('wallet')
        .leftJoin('wallet.transactions', 'transaction')
        .select('SUM(CASE WHEN transaction.type IN (:...types) THEN transaction.amount ELSE transaction.amount END)', 'balance')
        .where('wallet.id = :walletId', { walletId })
        .andWhere('transaction.confirmed = true')
        .setParameters({ types: ['deposit', 'revenue', 'fee', 'withdraw'] })
        .getRawOne();

      wallet.balance = result.balance !== null ? result.balance : 0;

      await this.walletRepository.save(wallet);

      return wallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Wallet not found');
      }
      throw new Error('Error updating wallet balance');
    }
  }
  
  // TODO: CREAR IM JOBS PARA CREAR INFORMES DE BALANCE
  async validateWalletBalance(walletId: string) {
    try {
      const wallet = await this.walletRepository.findOneOrFail({
        where: { id: walletId },
        relations: ['transactions'],
      });

      const relevantTransactions = wallet.transactions.filter(
        (transaction) => transaction.confirmed
      );

      const balanceTransaction = relevantTransactions.reduce(
        (total, transaction) => {
          if (transaction.type === 'deposit' || transaction.type === 'revenue') {
            return total + Math.round(transaction.amount * 100) / 100;
          } else if (transaction.type === 'fee' || transaction.type === 'withdraw') {
            return total + Math.round(transaction.amount * 100) / 100;
          }
          return total;
        },
        0
      );

      const balanceWallet = Number(wallet.balance);
      const roundedBalanceTransaction = Math.round(balanceTransaction * 100) / 100;
      const roundedBalanceWallet = Math.round(balanceWallet * 100) / 100;

      const balanceMatches = roundedBalanceWallet === roundedBalanceTransaction;

      return {
        message: balanceMatches ? 'Balance matches' : 'Balance does not match',
        status: balanceMatches,
        balance: roundedBalanceWallet,
        transactions: roundedBalanceTransaction,
      };
    } catch (error) {
      return {
        message: 'Wallet not found',
        status: false,
      };
    }
  }

  

  async getWalletAndTransactions(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOneOrFail({
        where: { id: walletId },
        relations: ['transactions'],
      });
      return wallet;
    } catch (error) {
      throw new NotFoundException('Wallet not found');
    }
  }




  async containsBalance(wallet: Wallet, amount: number): Promise<boolean> {
    await this.updateWalletBalance(wallet.id);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }
    return true;
  }


}
