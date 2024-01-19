import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'transfers'})
export class Transfer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    status: string;

    // deposit_id

    // withdraw_id

    // from_user

    // to_user

    // discount

    // fee

    @CreateDateColumn({
    })
    createDate: Date;

    @UpdateDateColumn({
    })
    updateDate: Date;
}
