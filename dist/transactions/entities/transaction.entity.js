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
exports.Transaction = void 0;
const transfer_entity_1 = require("../../transfers/entities/transfer.entity");
const wallet_entity_1 = require("../../wallets/entities/wallet.entity");
const typeorm_1 = require("typeorm");
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('bool', { default: false }),
    __metadata("design:type", Boolean)
], Transaction.prototype, "confirmed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: { description: 'No description' } }),
    __metadata("design:type", Object)
], Transaction.prototype, "meta", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({}),
    __metadata("design:type", Date)
], Transaction.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({}),
    __metadata("design:type", Date)
], Transaction.prototype, "updateDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallet_entity_1.Wallet, (wallet) => wallet.transactions),
    __metadata("design:type", wallet_entity_1.Wallet)
], Transaction.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transfer_entity_1.Transfer, (transfer) => transfer.deposit),
    __metadata("design:type", Array)
], Transaction.prototype, "depositTransfers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transfer_entity_1.Transfer, (transfer) => transfer.withdraw),
    __metadata("design:type", Array)
], Transaction.prototype, "withdrawTransfers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transfer_entity_1.Transfer, (transfer) => transfer.revenue),
    __metadata("design:type", Array)
], Transaction.prototype, "revenueTransfers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transfer_entity_1.Transfer, (transfer) => transfer.fee),
    __metadata("design:type", Array)
], Transaction.prototype, "feeTransfers", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)({ name: 'transactions' })
], Transaction);
//# sourceMappingURL=transaction.entity.js.map