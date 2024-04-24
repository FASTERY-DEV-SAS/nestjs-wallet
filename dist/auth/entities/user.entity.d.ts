import { Category } from 'src/categories/entities/category.entity';
import { Wallet } from 'src/wallets/entities/wallet.entity';
export declare class User {
    id: string;
    email: string;
    fullName: string;
    id_user: string;
    type_id_user: string;
    password: string;
    isActive: boolean;
    roles: string[];
    createDate: Date;
    updateDate: Date;
    wallet: Wallet;
    category: Category;
    checkEmailInsert(): void;
    checkEmailUpdate(): void;
}
