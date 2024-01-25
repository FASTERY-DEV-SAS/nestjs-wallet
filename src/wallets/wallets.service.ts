import { BadRequestException, Injectable } from '@nestjs/common';
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
  ) {}

  async createWallet(createWalletDto: CreateWalletDto, user: User) {
    try {
      const { ...walletDetails } = createWalletDto;
      const newwallet = this.walletRepository.create({
        ...walletDetails,
        user,
      });
      const wallet = await this.walletRepository.save(newwallet);

      return { ...wallet };
    } catch (error) {} 
  }
  // TODO: Crear un queryRunner para hacer la transacción
  // TODO:VALIDAR QUE SEA ParseUUIDPipe
  async updateWalletBalance(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOneOrFail({
      where: { id: walletId },
      relations: ['transactions'],
    });

    // Filtrar solo transacciones confirmadas y relacionadas con esta billetera
    const relevantTransactions = wallet.transactions.filter(
      (transaction) => transaction.confirmed,
    );
    // BUG: PROBLEMA DE RECALCULO DE SALDO
    // Calcular el nuevo saldo sumando o restando según el tipo de transacción
    wallet.balance = relevantTransactions.reduce((total, transaction) => {
      return (
        total +
        (transaction.type === 'deposit'
          ? +transaction.amount
          : +transaction.amount)
      );
    }, 0);
    // Guardar el nuevo saldo en la base de datos
    await this.walletRepository.save(wallet);
    return wallet;
  }

  // TODO: Errro code FIX
  async validateAmount(amount:number): Promise<boolean> {
    const amountRegex = /^[1-9]\d*(\.\d{1,2})?$/;
    if (!amountRegex.test(amount.toString())) {
      throw new BadRequestException('Amount must be a number with two decimals');
    }
    return true;
  }

  async getWalletAndTransactions(walletId:string): Promise<Wallet> {
    return await this.walletRepository.findOneOrFail({
      where: { id: walletId },
      relations: ['transactions'],
    });
  }

  async getWalletOne(walletId: string): Promise<Wallet> {
    return await this.walletRepository.findOne({ where: { id: walletId } });
  }
  
  // FIXME: PROBABLEMENTE LO QUITEMOS POR showWallets
  async getWalletOneAuth(walletId: string, user: User): Promise<Wallet | object> {
    if (user.roles.includes('admin') || user.isActive) {
      const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
      if (wallet) {
        return wallet;
      } else {
        return { message: 'La billetera no existe' , status: false};
      }
    } else {
      const wallet = await this.walletRepository.findOne({
        where: { id: walletId, user: { id: user.id } },
      });
  
      if (wallet) {
        return wallet;
      } else {
        return { message: 'La billetera no existe' , status: false};
      }
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

  async containsBalance(wallet: Wallet, amount:number): Promise<boolean> {
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
