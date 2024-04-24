import { Transfer } from 'src/transfers/entities/transfer.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
export declare class Transaction {
    id: string;
    amount: number;
    confirmed: boolean;
    meta: any | null;
    createDate: Date;
    updateDate: Date;
    wallet: Wallet;
    type: string;
    depositTransfers: Transfer[];
    withdrawTransfers: Transfer[];
    revenueTransfers: Transfer[];
    feeTransfers: Transfer[];
}
