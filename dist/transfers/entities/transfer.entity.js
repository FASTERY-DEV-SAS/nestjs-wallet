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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const category_entity_1 = require("../../categories/entities/category.entity");
const transaction_entity_1 = require("../../transactions/entities/transaction.entity");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const typeorm_1 = require("typeorm");
let Transfer = class Transfer {
};
exports.Transfer = Transfer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transfer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Transfer.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: { description: 'No description' } }),
    __metadata("design:type", Object)
], Transfer.prototype, "meta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Transfer.prototype, "processed_balance", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, (wallet) => wallet.sentTransfers, { eager: true }),
    __metadata("design:type", wallet_entity_1.Wallet)
], Transfer.prototype, "fromWallet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, (wallet) => wallet.receivedTransfers, { eager: true, nullable: true }),
    __metadata("design:type", wallet_entity_1.Wallet)
], Transfer.prototype, "toWallet", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, (transaction) => transaction.depositTransfers, { eager: true }),
    __metadata("design:type", transaction_entity_1.Transaction)
], Transfer.prototype, "deposit", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, (transaction) => transaction.withdrawTransfers, { eager: true }),
    __metadata("design:type", transaction_entity_1.Transaction)
], Transfer.prototype, "withdraw", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, (transaction) => transaction.revenueTransfers, { eager: true }),
    __metadata("design:type", transaction_entity_1.Transaction)
], Transfer.prototype, "revenue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.Transaction, (transaction) => transaction.feeTransfers, { eager: true }),
    __metadata("design:type", transaction_entity_1.Transaction)
], Transfer.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.categoryTransfers),
    __metadata("design:type", category_entity_1.Category)
], Transfer.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Transfer.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Transfer.prototype, "operationDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Transfer.prototype, "updateDate", void 0);
exports.Transfer = Transfer = __decorate([
    (0, typeorm_1.Entity)({ name: 'transfers' })
], Transfer);
//# sourceMappingURL=transfer.entity.js.map