"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileNamer = void 0;
const uuid_1 = require("uuid");
const fileNamer = (req, file, callback) => {
    if (!file)
        return callback(new Error('No file'), false);
    const fileExtensions = file.mimetype.split('/')[1];
    const fileName = (0, uuid_1.v4)() + '.' + fileExtensions;
    callback(null, fileName);
};
exports.fileNamer = fileNamer;
//# sourceMappingURL=file-namer.helper.js.map