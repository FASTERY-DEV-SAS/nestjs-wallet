"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsModule = void 0;
const common_1 = require("@nestjs/common");
const wallets_service_1 = require("./wallets.service");
const wallets_controller_1 = require("./wallets.controller");
const typeorm_1 = require("@nestjs/typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const auth_module_1 = require("../auth/auth.module");
let WalletsModule = class WalletsModule {
};
exports.WalletsModule = WalletsModule;
exports.WalletsModule = WalletsModule = __decorate([
    (0, common_1.Module)({
        controllers: [wallets_controller_1.WalletsController],
        providers: [wallets_service_1.WalletsService],
        imports: [auth_module_1.AuthModule, typeorm_1.TypeOrmModule.forFeature([wallet_entity_1.Wallet])],
        exports: [wallets_service_1.WalletsService, typeorm_1.TypeOrmModule],
    })
], WalletsModule);
//# sourceMappingURL=wallets.module.js.map