import { Category } from 'src/categories/entities/category.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
export declare class CreateIncomeDto {
    amount: number;
    meta: any | null;
    walletIdSelected: Wallet['id'];
    categoryIdSelected: Category['id'];
    fee: number;
    feeMeta: any | null;
}
