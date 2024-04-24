import { Category } from 'src/categories/entities/category.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
export declare class Transfer {
    id: string;
    type: string;
    meta: any | null;
    processed_balance: number;
    fromWallet: Wallet;
    toWallet: Wallet;
    deposit: Transaction;
    withdraw: Transaction;
    revenue: Transaction;
    fee: Transaction;
    category: Category;
    createDate: Date;
    operationDate: Date;
    updateDate: Date;
}
