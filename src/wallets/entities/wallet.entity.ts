import { User } from "src/auth/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'wallets'})
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text'})
    label_wallet: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'jsonb', nullable: true })
    meta: any | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balance: number;

    @Column({ type: 'int', default: 2 })
    decimal_places: number;

    @CreateDateColumn({
    })
    createDate: Date;

    @UpdateDateColumn({
    })
    updateDate: Date;

    @ManyToOne(
        () => User, 
        (user) => user.wallet,
    )
    user: User;
}