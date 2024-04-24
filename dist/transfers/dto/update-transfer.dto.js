"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTransferDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_transfer_dto_1 = require("./create-transfer.dto");
class UpdateTransferDto extends (0, mapped_types_1.PartialType)(create_transfer_dto_1.CreateTransferDto) {
}
exports.UpdateTransferDto = UpdateTransferDto;
//# sourceMappingURL=update-transfer.dto.js.map