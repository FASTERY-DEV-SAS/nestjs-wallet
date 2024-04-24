import { CreateTransferDto } from './dto/create-transfer.dto';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { CreateExpenseDto } from './dto/create-exprense.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
export declare class TransfersService {
    private readonly transactionsService;
    private readonly walletsService;
    private readonly transactionRepository;
    private readonly transferRepository;
    private readonly dataSource;
    constructor(transactionsService: TransactionsService, walletsService: WalletsService, transactionRepository: Repository<Transaction>, transferRepository: Repository<Transfer>, dataSource: DataSource);
    transferWalletToWallet(createTransferDto: CreateTransferDto, user: User): Promise<{
        message: string;
        status: boolean;
    }>;
    createIncome(createIncomeDto: CreateIncomeDto, user: User): Promise<any>;
    updateWalletBalance(queryRunner: QueryRunner, walletId: string, newBalance: number): Promise<void>;
    createExpense(createExpenseDto: CreateExpenseDto, user: User): Promise<{
        message: string;
        status: boolean;
    }>;
    allTransfers(user: User, paginationDto: PaginationDto): Promise<Transfer[]>;
    findOne(id: string): Promise<{}>;
}
