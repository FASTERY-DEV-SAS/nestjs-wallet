import { Transfer } from 'src/transfers/entities/transfer.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'transactions' })
export class Transaction {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  amount: number;

  @Column('bool', { default: false })
  confirmed: boolean;

  @Column({ type: 'jsonb', nullable: true, default: { description: 'No description' } })
  meta: any | null;

  @CreateDateColumn({})
  createDate: Date;

  @UpdateDateColumn({})
  updateDate: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @Column('text')
  type: string;


  @ManyToOne(() => Transfer, (transfer) => transfer.transactions)
  transfers: Transfer[];
 
}
