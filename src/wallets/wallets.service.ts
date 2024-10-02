import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Transfer } from 'src/transfers/entities/transfer.entity';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger('WalletsService');

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
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
      this.logger.error(`Error in createWallet`, error.stack);
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
      const wallet = await this.walletRepository.findOne({ where: { id: walletId, user: { id: user.id } } });
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
  // USER++
  async getTotalBalanceOfWallets(user: User): Promise<{
    statusCode: HttpStatus;
    total: number;
    message: string;
  }> {
    let overallBalance = 0;
    try {
      const wallets = await this.walletRepository.find({
        where: { user: { id: user.id } },
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
  // ADMIN+
  async updateWalletBalance(walletId: string): Promise<{
    statusCode: HttpStatus;
    message: string;
    walletId: string;
  }> {
    try {
      // Obtener la billetera por ID con las transferencias y sus categorías
      const wallet = await this.walletRepository.findOne({
        where: { id: walletId },
        relations: ['transfers', 'transfers.category'],  // Incluir las transferencias y categorías relacionadas
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      // Calcular ingresos y gastos
      let totalIncome = 0;
      let totalExpense = 0;

      wallet.transfers.forEach((transfer) => {
        if (transfer.category.type === 'income') {
          // Sumar el total de ingresos
          totalIncome += transfer.total;
        } else if (transfer.category.type === 'expense') {
          // Sumar el total de gastos
          totalExpense += transfer.total;
        }
      });

      // Calcular el balance final (ingresos - gastos)
      const balance = totalIncome - totalExpense;

      // Actualizar el balance de la billetera
      wallet.balance = balance;

      // Guardar la billetera con el nuevo balance
      await this.walletRepository.save(wallet);

      return {
        statusCode: HttpStatus.OK,
        message: 'Balance actualizado con éxito',
        walletId,
      };
    } catch (error) {
      this.logger.error(`Error in updateWalletBalance`, error.stack);
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message || 'Error updating wallet balance');
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error updating wallet balance',
        );
      }
    }
  }
  // ADMIN+
  async validateWalletBalance(user: User, walletId: string) {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { id: walletId, user: { id: user.id } },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found or does not belong to the user');
      }

      const transfers = await this.transferRepository.find({
        where: { wallet: { id: walletId } },
        relations: ['category'],
      });

      let totalIncome = 0;
      let totalExpense = 0;

      transfers.forEach((transfer) => {
        if (transfer.category.type === 'income') {
          totalIncome += transfer.total;
        } else if (transfer.category.type === 'expense') {
          totalExpense += transfer.total;
        }
      });

      const balanceTransaction = totalIncome - totalExpense;

      const balanceWallet = wallet.balance;

      const balanceMatches = balanceWallet === balanceTransaction;

      return {
        statusCode: HttpStatus.OK,
        message: balanceMatches ? 'Total SI coincide' : 'Total NO coincide',
        status: balanceMatches,
        balance: balanceWallet,
        transactions: balanceTransaction,
        totalExpense,
        totalIncome,
      };
    } catch (error) {
      this.logger.error(`Error in validateWalletBalance`, error.stack);
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message || 'Error validating wallet balance');
      } else {
        throw new InternalServerErrorException(
          error.message || 'Error validating wallet balance',
        );
      }
    }
  }
}
