import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { WalletsService } from 'src/wallets/wallets.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-exprense.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
export declare class TransfersController {
    private readonly walletsService;
    private readonly transfersService;
    private readonly logger;
    private isProcessing;
    private queue;
    constructor(walletsService: WalletsService, transfersService: TransfersService);
    transferWalletToWallet(createTransferDto: CreateTransferDto, user: User): Promise<{
        message: string;
        status: boolean;
    }>;
    createExpenseController(createExpenseDto: CreateExpenseDto, user: User): Promise<{
        message: string;
        status: boolean;
    }>;
    createIncomeController(createIncomeDto: CreateIncomeDto, user: User): Promise<any>;
    allTransfers(user: User, paginationDto: PaginationDto): Promise<import("./entities/transfer.entity").Transfer[]>;
    findOne(id: string): Promise<{}>;
}
