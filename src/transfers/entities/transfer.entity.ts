import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rate } from './rate.entity';

@Entity({ name: 'transfers' })
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  type: string;

  // @Column({ type: 'jsonb', nullable: true, default: { description: 'No rates' } })
  // rates: any | null;

  @Column({ type: 'jsonb', nullable: true, default: { description: 'No description' } })
  meta: any | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  amountEntered: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  walletBalanceBefore: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  total: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  walletBalanceAfter: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.sentTransfers, { eager: true, nullable: true })
  fromWallet: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.receivedTransfers, { eager: true, nullable: true })
  toWallet: Wallet;

  @OneToMany(() => Transaction, (transaction) => transaction.transfers, { eager: true , nullable: true})
  transactions: Transaction[];

  @ManyToOne(() => Category, (category) => category.categoryTransfers, { eager: true })
  category: Category;

  @OneToMany(() => Rate, (rate) => rate.transfer, { eager: true, nullable: true})
  rates: Rate[];

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
