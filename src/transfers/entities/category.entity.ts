import { User } from 'src/auth/entities/user.entity';
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

@Entity({ name: 'categories' })
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{ nullable: false })
    label: string;

    @Column('text',{ nullable: false })
    type: string;

    @Column('text',{ nullable: false })
    description: string;
    
    @Column({ type: 'jsonb', nullable: true })
    meta: any | null;

    @CreateDateColumn({})
    createDate: Date;

    @UpdateDateColumn({})
    updateDate: Date;
}
