import { User } from "src/auth/entities/user.entity";
import { Wallet } from "src/wallets/entities/wallet.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'transactions'})
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column('bool', { default: false })
    confirmed: boolean;

    @Column({ type: 'jsonb', nullable: true })
    meta: any | null;
    
    @CreateDateColumn({})
    createDate: Date;

    @UpdateDateColumn({})
    updateDate: Date;

    @ManyToOne(
        () => Wallet, 
        (wallet) => wallet.user,
    )
    wallet: Wallet;


    @Column('text')
    type: string;


    @ManyToOne(
        () => User, 
        (user_id) => user_id.transaction,
    )
    user_id: User;
}
