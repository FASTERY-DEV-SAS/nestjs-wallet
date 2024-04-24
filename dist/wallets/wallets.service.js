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
var WalletsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const typeorm_2 = require("typeorm");
let WalletsService = WalletsService_1 = class WalletsService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
        this.logger = new common_1.Logger(WalletsService_1.name);
        this.walletExistenceCache = new Map();
    }
    async createWallet(createWalletDto, user) {
        try {
            const { ...walletDetails } = createWalletDto;
            const newwallet = this.walletRepository.create({
                ...walletDetails,
                user,
            });
            const saveOperation = this.walletRepository.save(newwallet);
            await Promise.all([saveOperation]);
            return {
                message: 'Billetera creada con éxito',
                status: true,
                id: newwallet.id,
            };
        }
        catch (error) {
            throw new Error('Error creating wallet');
        }
    }
    async updateWallet(id, updateWalletDto) {
        try {
            const updateOperation = this.walletRepository.update(id, updateWalletDto);
            await Promise.all([updateOperation]);
            return {
                message: 'Billetera actualizada con éxito',
                status: true,
            };
        }
        catch (error) {
            throw new Error('Error updating wallet');
        }
    }
    async updateWalletBalance(walletId) {
        try {
            const wallet = await this.walletRepository.findOneOrFail({
                where: { id: walletId },
                relations: ['transactions'],
            });
            const result = await this.walletRepository
                .createQueryBuilder('wallet')
                .leftJoin('wallet.transactions', 'transaction')
                .select('SUM(CASE WHEN transaction.type IN (:...types) THEN transaction.amount ELSE transaction.amount END)', 'balance')
                .where('wallet.id = :walletId', { walletId })
                .andWhere('transaction.confirmed = true')
                .setParameters({ types: ['deposit', 'revenue', 'fee', 'withdraw'] })
                .getRawOne();
            wallet.balance = result.balance !== null ? parseFloat(result.balance) : 0;
            await this.walletRepository.save(wallet);
            return wallet;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            throw new Error('Error updating wallet balance');
        }
    }
    async validateWalletBalance(walletId) {
        try {
            const wallet = await this.walletRepository.findOneOrFail({
                where: { id: walletId },
                relations: ['transactions'],
            });
            const relevantTransactions = wallet.transactions.filter((transaction) => transaction.confirmed);
            const balanceTransaction = relevantTransactions.reduce((total, transaction) => {
                if (transaction.type === 'deposit' || transaction.type === 'revenue') {
                    return total + Math.round(transaction.amount * 100) / 100;
                }
                else if (transaction.type === 'fee' || transaction.type === 'withdraw') {
                    return total + Math.round(transaction.amount * 100) / 100;
                }
                return total;
            }, 0);
            const balanceWallet = Number(wallet.balance);
            const roundedBalanceTransaction = Math.round(balanceTransaction * 100) / 100;
            const roundedBalanceWallet = Math.round(balanceWallet * 100) / 100;
            const balanceMatches = roundedBalanceWallet === roundedBalanceTransaction;
            return {
                message: balanceMatches ? 'Balance matches' : 'Balance does not match',
                status: balanceMatches,
                balance: roundedBalanceWallet,
                transactions: roundedBalanceTransaction,
            };
        }
        catch (error) {
            return {
                message: 'Wallet not found',
                status: false,
            };
        }
    }
    validateAmount(amount) {
        const amountRegex = /^[1-9]\d*(\.\d{1,2})?$/;
        if (!amountRegex.test(amount.toString())) {
            throw new common_1.BadRequestException('Amount must be a number with two decimals');
        }
        return true;
    }
    async getWalletAndTransactions(walletId) {
        try {
            const wallet = await this.walletRepository.findOneOrFail({
                where: { id: walletId },
                relations: ['transactions'],
            });
            return wallet;
        }
        catch (error) {
            throw new common_1.NotFoundException('Wallet not found');
        }
    }
    async getWalletOne(walletId) {
        try {
            const wallet = await this.walletRepository.findOneOrFail({
                where: { id: walletId },
                relations: ['transactions']
            });
            return wallet;
        }
        catch (error) {
            if (error.name === 'EntityNotFound') {
                throw new common_1.NotFoundException('Wallet not found');
            }
            else {
                throw new Error('Error fetching wallet');
            }
        }
    }
    async getWalletOneAuth(walletId, user) {
        if (user.roles.includes('admin') || user.isActive) {
            const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
            if (wallet) {
                return wallet;
            }
            else {
                return { message: 'La billetera no existe', status: false };
            }
        }
        else {
            const wallet = await this.walletRepository.findOne({
                where: { id: walletId, user: { id: user.id } },
            });
            if (wallet) {
                return wallet;
            }
            else {
                return { message: 'La billetera no existe', status: false };
            }
        }
    }
    async overallBalance(user) {
        try {
            const wallets = await this.walletRepository.find({
                where: { user: { id: user.id } },
            });
            let overallBalance = 0;
            wallets.forEach((wallet) => {
                overallBalance += parseFloat(wallet.balance.toString());
            });
            return {
                status: true,
                total: overallBalance,
            };
        }
        catch (error) {
            throw new Error('Error retrieving overall balance');
        }
    }
    async showWallets(user) {
        try {
            return await this.walletRepository.find({
                where: { user: { id: user.id } },
                order: {
                    createDate: "ASC"
                }
            });
        }
        catch (error) {
            throw new Error('Error retrieving wallets');
        }
    }
    async containsBalance(wallet, amount) {
        await this.updateWalletBalance(wallet.id);
        if (wallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        return true;
    }
    async canWithdraw(walletId, amount) {
        try {
            const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
            if (wallet && wallet.balance >= amount) {
                return true;
            }
            else {
                throw new common_1.BadRequestException('Insufficient funds in the wallet');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException('Wallet not found');
        }
    }
    async walletIdExistsInUser(walletId, user) {
        const userId = user.id;
        if (this.walletExistenceCache.has(userId)) {
            this.logger.debug(`Cache Verificar: ${JSON.stringify(Array.from(this.walletExistenceCache))}`);
            return this.walletExistenceCache.get(userId);
        }
        const wallet = await this.walletRepository.findOne({ where: { id: walletId, user: { id: userId } } });
        const exists = !!wallet;
        this.walletExistenceCache.set(userId, exists);
        this.logger.debug(`Cache Actualizar: ${JSON.stringify(Array.from(this.walletExistenceCache))}`);
        return exists;
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = WalletsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map