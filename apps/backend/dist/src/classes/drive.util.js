"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDriveUrl = isDriveUrl;
exports.extractDriveFileId = extractDriveFileId;
exports.buildDriveDirectUrl = buildDriveDirectUrl;
exports.parseContentDispositionFilename = parseContentDispositionFilename;
const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const DRIVE_HOST_PATTERN = /(^|\.)drive\.(google|usercontent\.google)\.com$/;
const FILE_ID_IN_URL_PATTERN = /[?&]id=([a-zA-Z0-9_-]+)/;
const FILE_ID_IN_PATH_PATTERN = /\/file\/d\/([a-zA-Z0-9_-]+)/;
function hostname(url) {
    try {
        return new URL(url).hostname;
    }
    catch {
        return '';
    }
}
function isDriveUrl(url) {
    return DRIVE_HOST_PATTERN.test(hostname(url));
}
function extractDriveFileId(url) {
    if (!isDriveUrl(url))
        return null;
    const pathMatch = url.match(FILE_ID_IN_PATH_PATTERN);
    if (pathMatch)
        return pathMatch[1];
    const queryMatch = url.match(FILE_ID_IN_URL_PATTERN);
    if (queryMatch)
        return queryMatch[1];
    return null;
}
function buildDriveDirectUrl(fileId) {
    if (!FILE_ID_PATTERN.test(fileId)) {
        throw new Error('Invalid Google Drive file id');
    }
    const params = new URLSearchParams({
        id: fileId,
        export: 'download',
        authuser: '0',
        confirm: 't',
    });
    return `https://drive.usercontent.google.com/download?${params.toString()}`;
}
function parseContentDispositionFilename(header) {
    if (!header)
        return null;
    const utf8 = header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utf8) {
        try {
            return decodeURIComponent(utf8[1].trim());
        }
        catch {
            return utf8[1].trim();
        }
    }
    const quoted = header.match(/filename\s*=\s*"([^"]*)"/i);
    if (quoted)
        return quoted[1];
    const bare = header.match(/filename\s*=\s*([^;]+)/i);
    if (bare)
        return bare[1].trim();
    return null;
}
//# sourceMappingURL=drive.util.js.map