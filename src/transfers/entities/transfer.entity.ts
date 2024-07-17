import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
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

  @Column({ type: 'int', nullable: true, default: 0 })
  walletBalanceBefore: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  amountEntered: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  total: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  walletBalanceAfter: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transfers)
  wallet: Wallet;

  @ManyToOne(() => Category, (category) => category.transfers)
  category: Category;

  @OneToMany(() => Rate, (rate) => rate.transfer, { eager: true, nullable: true })
  rates: Rate[];

  @CreateDateColumn({
  })
  createAt: Date;

  @CreateDateColumn({
  })
  operationAt: Date;

  @UpdateDateColumn({
  })
  updateAt: Date;
}
