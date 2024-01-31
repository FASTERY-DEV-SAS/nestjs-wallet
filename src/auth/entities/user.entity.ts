import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Transfer } from 'src/transfers/entities/transfer.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column('text', { default: '' })
  fullName: string;

  @Column({ unique: true })
  id_user: string;

  @Column()
  type_id_user: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @CreateDateColumn({})
  createDate: Date;

  @UpdateDateColumn({})
  updateDate: Date;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @BeforeInsert()
  checkEmailInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkEmailUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
