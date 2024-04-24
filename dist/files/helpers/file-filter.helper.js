"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFilter = void 0;
const fileFilter = (req, file, callback) => {
    if (!file)
        return callback(new Error('No file'), false);
    const fileExtensions = file.mimetype.split('/')[1];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    if (allowedExtensions.includes(fileExtensions)) {
        return callback(null, true);
    }
    callback(null, false);
};
exports.fileFilter = fileFilter;
//# sourceMappingURL=file-filter.helper.js.map