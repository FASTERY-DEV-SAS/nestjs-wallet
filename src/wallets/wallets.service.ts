import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) { }

  async createWallet(createWalletDto: CreateWalletDto, user: User) {
    try {
      const { ...walletDetails } = createWalletDto;

      const newwallet = this.walletRepository.create({
        ...walletDetails,
        user,
      });

      const saveOperation = this.walletRepository.save(newwallet);

      await Promise.all([saveOperation]);

      return newwallet;
    } catch (error) {
      throw new Error('Error creating wallet');
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
  
  async validateAmount(amount: number): Promise<boolean> {
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
      const wallet = await this.walletRepository.findOne({
        where: { id: walletId },
        relations: ['transactions']
      });
  
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }
  
      return wallet;
    } catch (error) {
      throw new Error('Error fetching wallet');
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

  async overallBalance(user: User): Promise<number> {
    try {
      const wallets = await this.walletRepository.find({
        where: { user: { id: user.id } },
      });

      let overallBalance = 0;

      wallets.forEach((wallet) => {
        overallBalance += parseFloat(wallet.balance.toString());
      });

      return overallBalance;
    } catch (error) {
      throw new Error('Error retrieving overall balance');
    }
  }

  async showWallets(user: User): Promise<Wallet[]> {
    try {
      // Retorna las billeteras asociadas al usuario actual sin incluir las transacciones
      return await this.walletRepository.find({
        where: { user: { id: user.id } },
      });
    } catch (error) {
      // Maneja cualquier error que pueda ocurrir durante la recuperación
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

  async walletIdExistsInUser(walletId: string, user: User): Promise<boolean> {
    try {
      const wallet = await this.getWalletOne(walletId);
      if (wallet.user.id === user.id) {
        return true;
      } else {
        throw new BadRequestException('Wallet does not exist');
      }
    } catch (error) {
      throw new BadRequestException('Wallet does not exist');
    }
  }

  async canWithdraw(walletId: string, amount: number): Promise<boolean> {
    try {
      const wallet = await this.getWalletOne(walletId);
      if (wallet.balance >= amount) {
        return true;
      } else {
        throw new BadRequestException('Insufficient funds in the wallet');
      }
    } catch (error) {
      throw new BadRequestException('Wallet not found');
    }
  }

}
