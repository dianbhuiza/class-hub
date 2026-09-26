import { Injectable, Logger } from '@nestjs/common';
import {
  buildDriveDirectUrl,
  extractDriveFileId,
  isDriveUrl,
  parseContentDispositionFilename,
} from './drive.util';

export interface DriveFileInfo {
  fileId: string;
  filename: string | null;
  sizeBytes: number | null;
  contentType: string | null;
}

interface CacheEntry {
  expiresAt: number;
  value: DriveFileInfo | null;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private readonly cache = new Map<string, CacheEntry>();

  async getFileInfo(url: string): Promise<DriveFileInfo | null> {
    if (!isDriveUrl(url)) return null;

    const fileId = extractDriveFileId(url);
    if (!fileId) return null;

    const cached = this.cache.get(fileId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const value = await this.fetchFileInfo(fileId);
    this.cache.set(fileId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }

  private async fetchFileInfo(fileId: string): Promise<DriveFileInfo | null> {
    const directUrl = buildDriveDirectUrl(fileId);
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
        filename: parseContentDispositionFilename(
          res.headers.get('content-disposition'),
        ),
        sizeBytes: Number.isNaN(parsedSize) ? null : parsedSize,
        contentType: res.headers.get('content-type'),
      };
    } catch (err) {
      this.logger.warn(
        `Drive HEAD failed for file ${fileId}: ${(err as Error).message}`,
      );
      return { fileId, filename: null, sizeBytes: null, contentType: null };
    } finally {
      clearTimeout(timeout);
    }
  }
}
