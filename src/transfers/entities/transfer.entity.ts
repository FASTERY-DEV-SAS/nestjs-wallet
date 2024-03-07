import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'transfers' })
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  type: string;

  @Column({ type: 'jsonb', nullable: true, default: { description: 'No description' } })
  meta: any | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  processed_balance: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.sentTransfers, { eager: true })
  fromWallet: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.receivedTransfers, { eager: true , nullable: true})
  toWallet: Wallet;

  @ManyToOne(() => Transaction, (transaction) => transaction.depositTransfers, { eager: true })
  deposit: Transaction;

  @ManyToOne(() => Transaction, (transaction) => transaction.withdrawTransfers , { eager: true })
  withdraw: Transaction;

  @ManyToOne(() => Transaction, (transaction) => transaction.revenueTransfers , { eager: true })
  revenue: Transaction;

  @ManyToOne(() => Transaction, (transaction) => transaction.feeTransfers , { eager: true })
  fee: Transaction;

  @ManyToOne(() => Category, (category) => category.categoryTransfers)
  category:Category;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createDate: Date;
  
  // @Column({ type: 'date' })
  // FIXME: QUE SE PUEDA EDITAR ESTA FECHA Y FECHA DE CREACION
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  operationDate: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateDate: Date;
}
