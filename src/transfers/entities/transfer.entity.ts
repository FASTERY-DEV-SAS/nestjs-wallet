import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
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
  status: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.depositTransfers)
  deposit: Transaction;

  @ManyToOne(() => Transaction, (transaction) => transaction.withdrawTransfers)
  withdraw: Transaction;

  @ManyToOne(() => User, (user) => user.sentTransfers)
  fromUser: User;

  @ManyToOne(() => User, (user) => user.receivedTransfers)
  toUser: User;

  @Column({ type: 'text', nullable: true })
  discount: string;

  @Column({ type: 'text', nullable: true })
  fee: string;

  @CreateDateColumn({})
  createDate: Date;

  @UpdateDateColumn({})
  updateDate: Date;
}
