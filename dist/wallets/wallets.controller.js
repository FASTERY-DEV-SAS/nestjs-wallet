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
exports.WalletsController = void 0;
const common_1 = require("@nestjs/common");
const wallets_service_1 = require("./wallets.service");
const create_wallet_dto_1 = require("./dto/create-wallet.dto");
const update_wallet_dto_1 = require("./dto/update-wallet.dto");
const user_entity_1 = require("../auth/entities/user.entity");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const valid_roles_1 = require("../auth/interfaces/valid-roles");
const microservices_1 = require("@nestjs/microservices");
let WalletsController = class WalletsController {
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    createWallet(createWalletDto, user) {
        return this.walletsService.createWallet(createWalletDto, user);
    }
    update(id, updateWalletDto) {
        return this.walletsService.updateWallet(id, updateWalletDto);
    }
    getWalletOneAuth(id, user) {
        return this.walletsService.getWalletOneAuth(id, user);
    }
    overallBalance(user) {
        return this.walletsService.overallBalance(user);
    }
    showWallets(user) {
        return this.walletsService.showWallets(user);
    }
    updateWalletBalance(id) {
        return this.walletsService.updateWalletBalance(id);
    }
    validateWalletBalance(id) {
        return this.walletsService.validateWalletBalance(id);
    }
};
exports.WalletsController = WalletsController;
__decorate([
    (0, common_1.Post)('createWallet'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user, valid_roles_1.ValidRoles.admin),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wallet_dto_1.CreateWalletDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user, valid_roles_1.ValidRoles.admin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_wallet_dto_1.UpdateWalletDto]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('wallet/:id'),
    (0, microservices_1.MessagePattern)({ md: 'get-wallet-id' }),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user, valid_roles_1.ValidRoles.admin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "getWalletOneAuth", null);
__decorate([
    (0, common_1.Get)('overallBalance'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user, valid_roles_1.ValidRoles.admin),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "overallBalance", null);
__decorate([
    (0, common_1.Get)('showWallets'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user, valid_roles_1.ValidRoles.admin),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "showWallets", null);
__decorate([
    (0, common_1.Get)('updateWalletBalance/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "updateWalletBalance", null);
__decorate([
    (0, common_1.Get)('validateWalletBalance/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "validateWalletBalance", null);
exports.WalletsController = WalletsController = __decorate([
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService])
], WalletsController);
//# sourceMappingURL=wallets.controller.js.map