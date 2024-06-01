import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
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

  async createWallet(createWalletDto: CreateWalletDto, user: User): Promise<{
    statusCode: number;
    message: string;
    id: string;
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
        id: newwallet.id,
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
  }> {
    try {
      const updateOperation = this.walletRepository.update(id, updateWalletDto);
      await Promise.all([updateOperation]);
      return {
        statusCode: HttpStatus.OK,
        message: 'Billetera actualizada con éxito',
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

      wallet.balance = result.balance !== null ? parseFloat(result.balance) : 0;

      await this.walletRepository.save(wallet);

      return wallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Wallet not found');
      }
      throw new Error('Error updating wallet balance');
    }
  }

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

  validateAmount(amount: number) {
    const amountRegex = /^[1-9]\d*(\.\d{1,2})?$/;
    if (!amountRegex.test(amount.toString())) {
      throw new BadRequestException('Amount must be a number with two decimals');
    }
    return true;
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

  async getWalletOne(walletId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOneOrFail({
        where: { id: walletId },
        relations: ['transactions']
      });
      return wallet;
    } catch (error) {
      if (error.name === 'EntityNotFound') {
        throw new NotFoundException('Wallet not found');
      } else {
        throw new Error('Error fetching wallet');
      }
    }
  }

  // FIXME: PROBABLEMENTE LO QUITEMOS POR showWallets
  async getWalletOneAuth(walletId: string, user: User): Promise<Wallet | object> {
    if (user.roles.includes('admin') || user.isActive) {
      const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
      if (wallet) {
        return wallet;
      } else {
        return { message: 'La billetera no existe', status: false };
      }
    } else {
      const wallet = await this.walletRepository.findOne({
        where: { id: walletId, user: { id: user.id } },
      });

      if (wallet) {
        return wallet;
      } else {
        return { message: 'La billetera no existe', status: false };
      }
    }
  }

  async overallBalance(user: User) {
    try {
      const wallets = await this.walletRepository.find({
        where: { user: { id: user.id } },
      });

      let overallBalance = 0;

      wallets.forEach((wallet) => {
        overallBalance += parseFloat(wallet.balance.toString());
      });

      return {
        status: true,
        total: overallBalance,
      };
    } catch (error) {
      throw new Error('Error retrieving overall balance');
    }
  }

  async showWallets(user: User): Promise<Wallet[]> {
    try {
      return await this.walletRepository.find({
        where: { user: { id: user.id } },
        order: {
          createDate: "ASC"
        }
      });
    } catch (error) {
      throw new Error('Error retrieving wallets');
    }
  }


  async containsBalance(wallet: Wallet, amount: number): Promise<boolean> {
    await this.updateWalletBalance(wallet.id);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }
    return true;
  }

  // async walletIdExistsInUser(walletId: string, user: User): Promise<boolean> {
  //   try {
  //     const wallet = await this.walletRepository.findOne({ where: { id: walletId, user: { id: user.id } } });
  //     if (wallet) {
  //       return true;
  //     } else {
  //       throw new BadRequestException('Wallet does not exist');
  //     }
  //   } catch (error) {
  //     throw new BadRequestException('Wallet does not exist');
  //   }
  // }


  async canWithdraw(walletId: string, amount: number): Promise<boolean> {
    try {
      const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
      if (wallet && wallet.balance >= amount) {
        return true;
      } else {
        throw new BadRequestException('Insufficient funds in the wallet');
      }
    } catch (error) {
      throw new BadRequestException('Wallet not found');
    }
  }

  // TODO: EN CASO DE ELIMINAR LA WALLET QUE BORRE EL CACHE
  async walletIdExistsInUser(walletId: string, user: User): Promise<boolean> {
    const userId = user.id;

    // Verificar la caché
    if (this.walletExistenceCache.has(userId)) {
      this.logger.debug(`Cache Verificar: ${JSON.stringify(Array.from(this.walletExistenceCache))}`);
      return this.walletExistenceCache.get(userId);
    }

    // Consultar la base de datos
    const wallet = await this.walletRepository.findOne({ where: { id: walletId, user: { id: userId } } });
    const exists = !!wallet;

    // Actualizar la caché
    this.walletExistenceCache.set(userId, exists);
    this.logger.debug(`Cache Actualizar: ${JSON.stringify(Array.from(this.walletExistenceCache))}`);

    return exists;
  }


}
