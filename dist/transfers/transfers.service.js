"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("../transactions/entities/transaction.entity");
const typeorm_2 = require("typeorm");
const transfer_entity_1 = require("./entities/transfer.entity");
const transactions_service_1 = require("../transactions/transactions.service");
const wallets_service_1 = require("../wallets/wallets.service");
const wallet_entity_1 = require("../wallets/entities/wallet.entity");
let TransfersService = class TransfersService {
    constructor(transactionsService, walletsService, transactionRepository, transferRepository, dataSource) {
        this.transactionsService = transactionsService;
        this.walletsService = walletsService;
        this.transactionRepository = transactionRepository;
        this.transferRepository = transferRepository;
        this.dataSource = dataSource;
    }
    async transferWalletToWallet(createTransferDto, user) {
        try {
            await this.walletsService.validateAmount(createTransferDto.amount);
            const fromWallet = await this.walletsService.getWalletOne(createTransferDto.fromWalletId);
            await this.walletsService.containsBalance(fromWallet, createTransferDto.amount);
            const toWallet = await this.walletsService.getWalletOne(createTransferDto.toWalletId);
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const processedBalancefromWallet = +fromWallet.balance - +createTransferDto.amount - +createTransferDto.fee + +createTransferDto.revenue;
                console.log('previousBalance:', processedBalancefromWallet);
                await this.updateWalletBalance(queryRunner, fromWallet.id, processedBalancefromWallet);
                const processedBalancetoWallet = +toWallet.balance + +createTransferDto.amount;
                console.log('previousBalance:', processedBalancetoWallet);
                await this.updateWalletBalance(queryRunner, toWallet.id, processedBalancetoWallet);
                const transactionsCreationPromises = [
                    this.transactionsService.createNewTransaction(createTransferDto.fromWalletId, createTransferDto.amount * -1, "withdrawTransaction", "withdraw"),
                    this.transactionsService.createNewTransaction(createTransferDto.toWalletId, createTransferDto.amount, "depositTransaction", "deposit"),
                    this.transactionsService.createNewTransaction(createTransferDto.fromWalletId, createTransferDto.fee * -1, "feeTransaction", "fee"),
                    this.transactionsService.createNewTransaction(createTransferDto.fromWalletId, createTransferDto.revenue, "revenueTransaction", "revenue")
                ];
                const transactionData = await Promise.all(transactionsCreationPromises);
                await queryRunner.manager.save(transaction_entity_1.Transaction, transactionData);
                const transfer = this.transferRepository.create({
                    type: 'transfer',
                    deposit: transactionData[1],
                    withdraw: transactionData[0],
                    fromWallet: fromWallet,
                    toWallet: toWallet,
                    revenue: transactionData[3],
                    fee: transactionData[2],
                });
                await queryRunner.manager.save(transfer_entity_1.Transfer, transfer);
                await queryRunner.commitTransaction();
                return { message: 'Transferencia realizada con éxito', status: true };
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }
        catch (error) {
            return { message: 'Error al realizar la transferencia', status: false };
        }
    }
    async createIncome(createIncomeDto, user) {
        if (createIncomeDto.fee === undefined) {
            createIncomeDto.fee = 0;
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            this.walletsService.validateAmount(createIncomeDto.amount);
            await this.walletsService.walletIdExistsInUser(createIncomeDto.walletIdSelected, user);
            const fromWallet = await this.walletsService.getWalletOne(createIncomeDto.walletIdSelected);
            console.log('fromWallet:', fromWallet.balance);
            const processedBalance = +fromWallet.balance + +createIncomeDto.amount - +createIncomeDto.fee;
            console.log('previousBalance:', processedBalance);
            await this.updateWalletBalance(queryRunner, createIncomeDto.walletIdSelected, processedBalance);
            const transactionPromises = [
                this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, 0, { description: 'No description' }, "withdraw"),
                this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, createIncomeDto.amount, createIncomeDto.meta, "deposit"),
                this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, createIncomeDto.fee * -1, createIncomeDto.feeMeta, "fee"),
                this.transactionsService.createNewTransaction(createIncomeDto.walletIdSelected, 0, { description: 'No description' }, "revenue")
            ];
            const transactionData = await Promise.all(transactionPromises);
            await queryRunner.manager.save(transaction_entity_1.Transaction, transactionData);
            const transfer = this.transferRepository.create({
                type: 'income',
                deposit: transactionData[1],
                withdraw: transactionData[0],
                fromWallet: { id: createIncomeDto.walletIdSelected },
                toWallet: null,
                revenue: transactionData[3],
                fee: transactionData[2],
                category: { id: createIncomeDto.categoryIdSelected },
                processed_balance: processedBalance
            });
            await queryRunner.manager.save(transfer_entity_1.Transfer, transfer);
            await queryRunner.commitTransaction();
            return { message: 'Transferencia realizada con éxito', status: true };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(error);
            return { message: 'Error al realizar la transferencia', status: false };
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateWalletBalance(queryRunner, walletId, newBalance) {
        await queryRunner.manager.update(wallet_entity_1.Wallet, walletId, { balance: newBalance });
    }
    async createExpense(createExpenseDto, user) {
        if (createExpenseDto.fee === undefined) {
            createExpenseDto.fee = 0;
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await Promise.all([
                this.walletsService.validateAmount(createExpenseDto.amount),
                this.walletsService.canWithdraw(createExpenseDto.walletIdSelected, createExpenseDto.amount)
            ]);
            const fromWallet = await this.walletsService.getWalletOne(createExpenseDto.walletIdSelected);
            console.log('fromWallet:', fromWallet.balance);
            const processedBalance = +fromWallet.balance - +createExpenseDto.amount - +createExpenseDto.fee;
            console.log('previousBalance:', processedBalance);
            await this.updateWalletBalance(queryRunner, createExpenseDto.walletIdSelected, processedBalance);
            const transactionPromises = [
                this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, createExpenseDto.amount * -1, createExpenseDto.meta, "withdraw"),
                this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, 0, { description: 'No description' }, "deposit"),
                this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, createExpenseDto.fee * -1, { description: 'No description' }, "fee"),
                this.transactionsService.createNewTransaction(createExpenseDto.walletIdSelected, 0, { description: 'No description' }, "revenue")
            ];
            const transactionData = await Promise.all(transactionPromises);
            await queryRunner.manager.save(transaction_entity_1.Transaction, transactionData);
            const transfer = this.transferRepository.create({
                type: 'expense',
                deposit: transactionData[1],
                withdraw: transactionData[0],
                fromWallet: { id: createExpenseDto.walletIdSelected },
                toWallet: null,
                revenue: transactionData[3],
                fee: transactionData[2],
                category: { id: createExpenseDto.categoryIdSelected },
                processed_balance: processedBalance
            });
            await queryRunner.manager.save(transfer_entity_1.Transfer, transfer);
            await queryRunner.commitTransaction();
            return { message: 'Transferencia realizada con éxito', status: true };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(error);
            return { message: 'Error al realizar la transferencia', status: false };
        }
        finally {
            await queryRunner.release();
        }
    }
    async allTransfers(user, paginationDto) {
        try {
            const month = parseInt(paginationDto.month, 10);
            const year = parseInt(paginationDto.year, 10);
            if (isNaN(month) || isNaN(year)) {
                throw new Error('Mes o año no válidos');
            }
            const queryBuilder = this.transferRepository
                .createQueryBuilder('transfers')
                .leftJoinAndSelect('transfers.fromWallet', 'fromWallet')
                .leftJoinAndSelect('transfers.toWallet', 'toWallet')
                .leftJoinAndSelect('transfers.deposit', 'deposit')
                .leftJoinAndSelect('transfers.withdraw', 'withdraw')
                .leftJoinAndSelect('transfers.revenue', 'revenue')
                .leftJoinAndSelect('transfers.fee', 'fee')
                .leftJoinAndSelect('transfers.category', 'category')
                .where('fromWallet.user = :userId', { userId: user.id })
                .andWhere('EXTRACT(MONTH FROM transfers.operationDate) = :month', { month })
                .andWhere('EXTRACT(YEAR FROM transfers.operationDate) = :year', { year });
            if (paginationDto.walletId) {
                queryBuilder.andWhere('(fromWallet.id = :walletId OR toWallet.id = :walletId)', { walletId: paginationDto.walletId });
            }
            if (paginationDto.categoryId) {
                queryBuilder.andWhere('category.id = :categoryId', { categoryId: paginationDto.categoryId });
            }
            if (paginationDto.type) {
                queryBuilder.andWhere('transfers.type = :type', { type: paginationDto.type });
            }
            if (paginationDto.search) {
                queryBuilder.andWhere('(transfers.meta::text ILIKE :search OR transfers.status ILIKE :search)', { search: `%${paginationDto.search}%` });
            }
            const transfers = await queryBuilder
                .orderBy('transfers.operationDate', 'DESC')
                .skip(paginationDto.offset || 0)
                .take(paginationDto.limit)
                .getMany();
            if (transfers.length === 0) {
                return [];
            }
            return transfers;
        }
        catch (error) {
            console.error('Error al obtener transferencias:', error.message);
            throw new Error('Error al obtener transferencias');
        }
        finally {
        }
    }
    async findOne(id) {
        try {
            const transfer = await this.transferRepository.findOne({ where: { id } });
            return transfer;
        }
        catch (error) {
            console.error('Error al obtener transferencia:', error);
            return {};
        }
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(transactions_service_1.TransactionsService)),
    __param(1, (0, common_1.Inject)(wallets_service_1.WalletsService)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(3, (0, typeorm_1.InjectRepository)(transfer_entity_1.Transfer)),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService,
        wallets_service_1.WalletsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map