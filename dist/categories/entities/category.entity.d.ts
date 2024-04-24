import { User } from 'src/auth/entities/user.entity';
import { Transfer } from 'src/transfers/entities/transfer.entity';
export declare class Category {
    id: string;
    label: string;
    type: string;
    description: string;
    meta: any | null;
    createDate: Date;
    updateDate: Date;
    user: User;
    categoryTransfers: Transfer[];
}
