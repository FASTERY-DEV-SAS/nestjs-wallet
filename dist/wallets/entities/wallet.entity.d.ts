import { User } from 'src/auth/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Transfer } from 'src/transfers/entities/transfer.entity';
export declare class Wallet {
    id: string;
    label_wallet: string;
    description_wallet: string;
    isActive: boolean;
    meta: any | null;
    balance: number;
    createDate: Date;
    updateDate: Date;
    type: string;
    user: User;
    transactions: Transaction[];
    sentTransfers: Transfer[];
    receivedTransfers: Transfer[];
}
