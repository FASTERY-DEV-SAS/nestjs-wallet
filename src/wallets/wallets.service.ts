import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger('WalletsService');

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) { }

  // USER++
  async createWallet(createWalletDto: CreateWalletDto, user: User): Promise<{
    statusCode: HttpStatus;
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
      this.logger.error(`Error in createWallet`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al crear la billetera';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al crear la billetera',
        );
      }
    }
  }
  // USER++
  async updateWallet(id: string, updateWalletDto: UpdateWalletDto): Promise<{
    statusCode: HttpStatus;
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
      this.logger.error(`Error in updateWallet`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al actualizar la billetera';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al actualizar la billetera',
        );
      }
    }
  }
  // USER++
  async getWallet(walletId: string, user: User): Promise<{
    wallet: Wallet;
    statusCode: HttpStatus;
    message: string;
  }> {
    try {
      const wallet = await this.walletRepository.findOne({ where: { id: walletId, user: { id: user.id }, isActive: true } });
      return {
        statusCode: HttpStatus.OK,
        wallet,
        message: 'Billetera del usuario',
      }
    } catch (error) {
      this.logger.error(`Error in getOneWallet`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al obtener la billetera del usuario';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al obtener la billetera del usuario',
        );
      }
    }

  }
  // USER++
  async getTotalBalanceOfWallets(user: User): Promise<{
    statusCode: HttpStatus;
    total: number;
    message: string;
  }> {
    let overallBalance = 0;
    try {
      const wallets = await this.walletRepository.find({
        where: { user: { id: user.id }},
        // where: { user: { id: user.id }, isActive: true },
        // TODO: ANALIZAR SI SE DEBE AGREGAR EL CAMPO DE ACTIVO
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
      this.logger.error(`Error in getTotalBalanceOfWallets`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al obtener el balance general de las billeteras';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al obtener el balance general de las billeteras',
        );
      }
    }
  }
  // USER++
  async getWallets(user: User): Promise<{
    statusCode: HttpStatus;
    message: string;
    wallets: Wallet[];
  }> {
    try {
      const wallets = await this.walletRepository.find({
        where: { user: { id: user.id } },
        order: {
          balance: 'DESC'
        }
      });
      return {
        wallets,
        statusCode: HttpStatus.OK,
        message: 'Billeteras del usuario',
      }
    } catch (error) {
      this.logger.error(`Error in getWallets`);
      if (error instanceof BadRequestException) {
        error.message || 'Ocurrió un error al obtener las billeteras del usuario';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Ocurrió un error al obtener las billeteras del usuario',
        );
      }
    }

  }
  // ADMIN+
  async updateWalletBalance(walletId: string): Promise<{
    statusCode: HttpStatus;
    message: string;
    walletId: string;
  }> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { id: walletId },
        relations: ['transactions'],
      });
      // FIXME: REVISAR CODIGO
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

      return {
        statusCode: HttpStatus.OK,
        message: 'Balance actualizado con éxito',
        walletId,
      };
    } catch (error) {
      this.logger.error(`Error in updateWalletBalance`);
      if (error instanceof BadRequestException) {
        error.message || 'Error updating wallet balance';
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error updating wallet balance',
        );
      }
    }
  }
  // ADMIN+
  // async validateWalletBalance(walletId: string) {
  //   try {
  //     const wallet = await this.walletRepository.findOne({
  //       where: { id: walletId },
  //       relations: ['transactions'],
  //     });

  //     const relevantTransactions = wallet.transactions.filter(
  //       (transaction) => transaction.confirmed
  //     );
  //     const balanceTransaction = relevantTransactions.reduce(
  //       (total, transaction) => {
  //         if (transaction.type === 'deposit' || transaction.type === 'revenue') {
  //           return total + Math.round(transaction.amount * 100) / 100;
  //         } else if (transaction.type === 'fee' || transaction.type === 'withdraw') {
  //           return total + Math.round(transaction.amount * 100) / 100;
  //         }
  //         return total;
  //       },
  //       0
  //     );

  //     const balanceWallet = Number(wallet.balance);
  //     const roundedBalanceTransaction = Math.round(balanceTransaction * 100) / 100;
  //     const roundedBalanceWallet = Math.round(balanceWallet * 100) / 100;

  //     const balanceMatches = roundedBalanceWallet === roundedBalanceTransaction;

  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: balanceMatches ? 'Balance matches' : 'Balance does not match',
  //       status: balanceMatches,
  //       balance: roundedBalanceWallet,
  //       transactions: roundedBalanceTransaction,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Error in validateWalletBalance`);
  //     if (error instanceof BadRequestException) {
  //       error.message || 'Error validating wallet balance';
  //     } else {
  //       throw new InternalServerErrorException(
  //         error.message || 'Error validating wallet balance',
  //       );
  //     }
  //   }
  // }

  // async getWalletAndTransactions(walletId: string): Promise<Wallet> {
  //   try {
  //     const wallet = await this.walletRepository.findOneOrFail({
  //       where: { id: walletId },
  //       relations: ['transactions'],
  //     });
  //     return wallet;
  //   } catch (error) {
  //     throw new NotFoundException('Wallet not found');
  //   }
  // }


  // async containsBalance(wallet: Wallet, amount: number): Promise<boolean> {
  //   await this.updateWalletBalance(wallet.id);
  //   if (wallet.balance < amount) {
  //     throw new BadRequestException('Insufficient funds');
  //   }
  //   return true;
  // }
}
