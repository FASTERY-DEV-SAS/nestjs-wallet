import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { UpdateWalletDto } from './dto/update-wallet.dto';
export declare class WalletsService {
    private readonly walletRepository;
    private readonly logger;
    private walletExistenceCache;
    constructor(walletRepository: Repository<Wallet>);
    createWallet(createWalletDto: CreateWalletDto, user: User): Promise<{
        message: string;
        status: boolean;
        id: string;
    }>;
    updateWallet(id: string, updateWalletDto: UpdateWalletDto): Promise<{
        message: string;
        status: boolean;
    }>;
    updateWalletBalance(walletId: string): Promise<Wallet>;
    validateWalletBalance(walletId: string): Promise<{
        message: string;
        status: boolean;
        balance: number;
        transactions: number;
    } | {
        message: string;
        status: boolean;
        balance?: undefined;
        transactions?: undefined;
    }>;
    validateAmount(amount: number): boolean;
    getWalletAndTransactions(walletId: string): Promise<Wallet>;
    getWalletOne(walletId: string): Promise<Wallet>;
    getWalletOneAuth(walletId: string, user: User): Promise<Wallet | object>;
    overallBalance(user: User): Promise<{
        status: boolean;
        total: number;
    }>;
    showWallets(user: User): Promise<Wallet[]>;
    containsBalance(wallet: Wallet, amount: number): Promise<boolean>;
    canWithdraw(walletId: string, amount: number): Promise<boolean>;
    walletIdExistsInUser(walletId: string, user: User): Promise<boolean>;
}
