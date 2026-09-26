export interface DriveFileInfo {
    fileId: string;
    filename: string | null;
    sizeBytes: number | null;
    contentType: string | null;
}
export declare class DriveService {
    private readonly logger;
    private readonly cache;
    getFileInfo(url: string): Promise<DriveFileInfo | null>;
    private fetchFileInfo;
}
