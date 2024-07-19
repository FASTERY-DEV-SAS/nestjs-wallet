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
import { Transfer } from './transfer.entity';

@Entity({ name: 'rates' })
export class Rate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  type: string;

  @Column('text', { nullable: true })
  subType: string;

  @Column('text')
  incomeExpenseType: string;

  @Column('text')
  typeRate: string;

  @Column({ type: 'int' })
  value: number;

  @ManyToOne(() => Transfer, (transfer) => transfer.rates)
  transfer: Transfer;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @Column('json', { nullable: true })
  meta: Record<string, any>;
}
