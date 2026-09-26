export declare function isDriveUrl(url: string): boolean;
export declare function extractDriveFileId(url: string): string | null;
export declare function buildDriveDirectUrl(fileId: string): string;
export declare function parseContentDispositionFilename(header: string | null | undefined): string | null;
