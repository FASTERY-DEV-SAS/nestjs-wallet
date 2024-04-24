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
exports.Category = void 0;
const user_entity_1 = require("../../auth/entities/user.entity");
const transfer_entity_1 = require("../../transfers/entities/transfer.entity");
const typeorm_1 = require("typeorm");
let Category = class Category {
};
exports.Category = Category;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: false }),
    __metadata("design:type", String)
], Category.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: false }),
    __metadata("design:type", String)
], Category.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: false }),
    __metadata("design:type", String)
], Category.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Category.prototype, "meta", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({}),
    __metadata("design:type", Date)
], Category.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({}),
    __metadata("design:type", Date)
], Category.prototype, "updateDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.category),
    __metadata("design:type", user_entity_1.User)
], Category.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transfer_entity_1.Transfer, (transfer) => transfer.category),
    __metadata("design:type", Array)
], Category.prototype, "categoryTransfers", void 0);
exports.Category = Category = __decorate([
    (0, typeorm_1.Entity)({ name: 'categories' })
], Category);
//# sourceMappingURL=category.entity.js.map