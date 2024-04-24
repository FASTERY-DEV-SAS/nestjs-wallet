import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { User } from 'src/auth/entities/user.entity';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    createWallet(createWalletDto: CreateWalletDto, user: User): Promise<{
        message: string;
        status: boolean;
        id: string;
    }>;
    update(id: string, updateWalletDto: UpdateWalletDto): Promise<{
        message: string;
        status: boolean;
    }>;
    getWalletOneAuth(id: string, user: User): Promise<object | import("./entities/wallet.entity").Wallet>;
    overallBalance(user: User): Promise<{
        status: boolean;
        total: number;
    }>;
    showWallets(user: User): Promise<import("./entities/wallet.entity").Wallet[]>;
    updateWalletBalance(id: string): Promise<import("./entities/wallet.entity").Wallet>;
    validateWalletBalance(id: string): Promise<{
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
}
