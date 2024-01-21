import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
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
  async updateWalletBalance(walletId: string): Promise<void> {
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
  }

  // TODO: Errro code FIX
  async validateAmountToTransfer(amount:number): Promise<boolean> {
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
    return this.walletRepository.findOne({ where: { id: walletId } });
  }

  async containsBalance(wallet: Wallet, amount:number): Promise<boolean> {
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }
    return true;
  }

}
