import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  label_wallet: string;

  @Column({ type: 'text', nullable: true })
  description_wallet: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true, default: { currency: 'USD' } })
  meta: any | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn({})
  createDate: Date;

  @UpdateDateColumn({})
  updateDate: Date;

  @ManyToOne(() => User, (user) => user.wallet)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];
}
