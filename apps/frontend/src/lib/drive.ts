const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const DRIVE_HOST_PATTERN = /(^|\.)drive\.(google|usercontent\.google)\.com$/;

function hostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function isDriveUrl(url: string): boolean {
  return DRIVE_HOST_PATTERN.test(hostname(url));
}

export function extractDriveFileId(url: string): string | null {
  if (!isDriveUrl(url)) return null;

  const pathMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch) return pathMatch[1];

  const queryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch) return queryMatch[1];

  return null;
}

export function buildDriveDirectUrl(fileId: string): string {
  if (!FILE_ID_PATTERN.test(fileId)) return '';
  const params = new URLSearchParams({
    id: fileId,
    export: 'download',
    authuser: '0',
    confirm: 't',
  });
  return `https://drive.usercontent.google.com/download?${params.toString()}`;
}

// Page del reproductor propio de Drive. Se embebe en un <iframe> porque el
// navegador no puede cargar el archivo en un <video>: Drive responde 403 a
// cualquier peticion cross-site con `Sec-Fetch-Site: cross-site`, cabecera que
// el navegador anade de forma automatica e inmutable. La pagina /preview no
// esta bloqueada (y no manda X-Frame-Options), y el trafico del video lo
// sirve Google, sin pasar por nuestro backend.
export function buildDrivePreviewUrl(fileId: string): string {
  if (!FILE_ID_PATTERN.test(fileId)) return '';
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function directUrlFrom(url: string): string {
  const fileId = extractDriveFileId(url);
  return fileId ? buildDriveDirectUrl(fileId) : '';
}

export function previewUrlFrom(url: string): string {
  const fileId = extractDriveFileId(url);
  return fileId ? buildDrivePreviewUrl(fileId) : '';
}

export function formatBytes(bytes: number | null): string | null {
  if (bytes === null || !Number.isFinite(bytes) || bytes <= 0) return null;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const decimals = exponent === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toFixed(decimals)} ${units[exponent]}`;
}
