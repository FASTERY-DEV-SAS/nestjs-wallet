import { Transaction } from './entities/transaction.entity';
export declare class TransactionsService {
    createNewTransaction(walletId: string, amount: number, meta: any, type: string): Transaction;
}
