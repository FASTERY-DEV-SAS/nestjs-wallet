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
var TransfersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersController = void 0;
const common_1 = require("@nestjs/common");
const transfers_service_1 = require("./transfers.service");
const create_transfer_dto_1 = require("./dto/create-transfer.dto");
const wallets_service_1 = require("../wallets/wallets.service");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const valid_roles_1 = require("../auth/interfaces/valid-roles");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const user_entity_1 = require("../auth/entities/user.entity");
const create_income_dto_1 = require("./dto/create-income.dto");
const create_exprense_dto_1 = require("./dto/create-exprense.dto");
const pagination_dto_1 = require("../common/dtos/pagination.dto");
let TransfersController = TransfersController_1 = class TransfersController {
    constructor(walletsService, transfersService) {
        this.walletsService = walletsService;
        this.transfersService = transfersService;
        this.logger = new common_1.Logger(TransfersController_1.name);
        this.isProcessing = false;
        this.queue = [];
    }
    transferWalletToWallet(createTransferDto, user) {
        return this.transfersService.transferWalletToWallet(createTransferDto, user);
    }
    async createExpenseController(createExpenseDto, user) {
        return this.transfersService.createExpense(createExpenseDto, user);
    }
    async createIncomeController(createIncomeDto, user) {
        return this.transfersService.createIncome(createIncomeDto, user);
    }
    allTransfers(user, paginationDto) {
        return this.transfersService.allTransfers(user, paginationDto);
    }
    findOne(id) {
        return this.transfersService.findOne(id);
    }
};
exports.TransfersController = TransfersController;
__decorate([
    (0, common_1.Post)('transfer'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transfer_dto_1.CreateTransferDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "transferWalletToWallet", null);
__decorate([
    (0, common_1.Post)('createExpense'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user, valid_roles_1.ValidRoles.admin),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exprense_dto_1.CreateExpenseDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "createExpenseController", null);
__decorate([
    (0, common_1.Post)('createIncome'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user, valid_roles_1.ValidRoles.admin),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_income_dto_1.CreateIncomeDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "createIncomeController", null);
__decorate([
    (0, common_1.Get)('allTransfers'),
    (0, auth_decorator_1.Auth)(valid_roles_1.ValidRoles.user),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "allTransfers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "findOne", null);
exports.TransfersController = TransfersController = TransfersController_1 = __decorate([
    (0, common_1.Controller)('transfers'),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService,
        transfers_service_1.TransfersService])
], TransfersController);
//# sourceMappingURL=transfers.controller.js.map