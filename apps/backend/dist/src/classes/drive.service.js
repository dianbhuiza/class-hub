"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DriveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveService = void 0;
const common_1 = require("@nestjs/common");
const drive_util_1 = require("./drive.util");
const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
let DriveService = DriveService_1 = class DriveService {
    logger = new common_1.Logger(DriveService_1.name);
    cache = new Map();
    async getFileInfo(url) {
        if (!(0, drive_util_1.isDriveUrl)(url))
            return null;
        const fileId = (0, drive_util_1.extractDriveFileId)(url);
        if (!fileId)
            return null;
        const cached = this.cache.get(fileId);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.value;
        }
        const value = await this.fetchFileInfo(fileId);
        this.cache.set(fileId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
        return value;
    }
    async fetchFileInfo(fileId) {
        const directUrl = (0, drive_util_1.buildDriveDirectUrl)(fileId);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const res = await fetch(directUrl, {
                method: 'HEAD',
                redirect: 'follow',
                signal: controller.signal,
            });
            if (!res.ok) {
                this.logger.warn(`Drive HEAD ${res.status} for file ${fileId}`);
                return {
                    fileId,
                    filename: null,
                    sizeBytes: null,
                    contentType: null,
                };
            }
            const contentLength = res.headers.get('content-length');
            const parsedSize = contentLength ? Number.parseInt(contentLength, 10) : NaN;
            return {
                fileId,
                filename: (0, drive_util_1.parseContentDispositionFilename)(res.headers.get('content-disposition')),
                sizeBytes: Number.isNaN(parsedSize) ? null : parsedSize,
                contentType: res.headers.get('content-type'),
            };
        }
        catch (err) {
            this.logger.warn(`Drive HEAD failed for file ${fileId}: ${err.message}`);
            return { fileId, filename: null, sizeBytes: null, contentType: null };
        }
        finally {
            clearTimeout(timeout);
        }
    }
};
exports.DriveService = DriveService;
exports.DriveService = DriveService = DriveService_1 = __decorate([
    (0, common_1.Injectable)()
], DriveService);
//# sourceMappingURL=drive.service.js.map