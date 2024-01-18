import { Wallet } from "src/wallets/entities/wallet.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    id_user: string;

    @Column()
    type_id_user: string;

    @Column('text',{
        select: false
    })
    password: string;

    @Column('bool', { default: true })
    isActive: boolean;

    @Column('text', { array: true, default: ['user'] })
    roles: string[];


    @OneToMany(
        () => Wallet, 
        (wallet) => wallet.user,
    )
    wallet: Wallet;


    @BeforeInsert()
    checkEmailInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkEmailUpdate() {
        this.email = this.email.toLowerCase().trim();
    }

}
