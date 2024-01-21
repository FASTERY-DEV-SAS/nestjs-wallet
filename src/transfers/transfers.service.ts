import { Inject, Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { WalletsService } from 'src/wallets/wallets.service';

@Injectable()
export class TransfersService {
  
  constructor(
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,

    @Inject(WalletsService)
    private readonly walletsService: WalletsService,
    
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
  ) {}

  async transferMoney(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
  ) {
    const amountRegex = /^[1-9]\d*(\.\d{1,2})?$/;
    if (!amountRegex.test(amount.toString())) {
      return {
        message:
          'El monto debe ser un número mayor a 1 y con máximo 2 decimales.',
        status: false,
      };
    }
    // Obtener la billetera de origen y destino
    const fromWallet = await this.walletRepository.findOneOrFail({
      where: { id: fromWalletId },
      relations: ['transactions'],
    });
    const toWallet = await this.walletRepository.findOneOrFail({
      where: { id: toWalletId },
      relations: ['transactions'],
    });

    // Verificar si la billetera de origen tiene saldo suficiente
    if (fromWallet.balance < amount) {
      return {
        message: 'Saldo insuficiente para realizar la transferencia',
        status: false,
      };
    }

    // Iniciar una transacción
    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Realizar la transacción de retiro
      const withdrawTransaction = await this.transactionsService.createTransaction(
        fromWalletId,
        amount * -1,
      );
      await this.transactionRepository.save(withdrawTransaction);

      // Realizar la transacción de depósito
      const depositTransaction = await this.transactionsService.createTransaction(
        toWalletId,
        amount,
      );
      await this.transactionRepository.save(depositTransaction);

      const transfer = this.transferRepository.create({
        status: 'transfer', // Puedes ajustar esto según tus necesidades
        deposit: depositTransaction,
        withdraw: withdrawTransaction,
        fromUser: fromWallet.user, // Asume que hay una relación user en la entidad Wallet
        toUser: toWallet.user, // Asume que hay una relación user en la entidad Wallet
        discount: '0', // Puedes ajustar esto según tus necesidades
        fee: '0', // Puedes ajustar esto según tus necesidades
      });

      // Actualizar los saldos de las billeteras
      await this.walletsService.updateWalletBalance(fromWalletId);
      await this.walletsService.updateWalletBalance(toWalletId);

      await this.transferRepository.save(transfer);

      // Confirmar la transacción
      await queryRunner.commitTransaction();
      return { message: 'Transferencia realizada con éxito', status: true };

    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      return { message: 'Error al realizar la transferencia', status: false };
    } finally {
      await queryRunner.release();
    }
  }

 
  create(createTransferDto: CreateTransferDto) {
    return 'This action adds a new transfer';
  }

  findAll() {
    return `This action returns all transfers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transfer`;
  }

  update(id: number, updateTransferDto: UpdateTransferDto) {
    return `This action updates a #${id} transfer`;
  }

  remove(id: number) {
    return `This action removes a #${id} transfer`;
  }
}
