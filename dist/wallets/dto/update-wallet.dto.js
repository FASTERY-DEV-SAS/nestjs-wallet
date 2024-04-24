"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWalletDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_wallet_dto_1 = require("./create-wallet.dto");
class UpdateWalletDto extends (0, mapped_types_1.PartialType)(create_wallet_dto_1.CreateWalletDto) {
}
exports.UpdateWalletDto = UpdateWalletDto;
//# sourceMappingURL=update-wallet.dto.js.map