import { User } from "src/auth/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'wallets'})
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', nullable: true })
    holder_type: string;

    @Column({ type: 'text'})
    label_wallet: string;

    @Column({ type: 'text', nullable: true })
    holder_id: number | string;

    @Column({ type: 'text', nullable: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'jsonb', nullable: true })
    meta: any | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balance: number;

    @Column({ type: 'int', default: 2 })
    decimal_places: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToOne(
        () => User, 
        (user) => user.wallet,
    )
    user: User;
}