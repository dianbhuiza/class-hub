import { formatBytes } from '../lib/drive';

interface DownloadButtonProps {
  href: string | null;
  filename?: string | null;
  sizeBytes?: number | null;
  size?: 'sm' | 'md';
}

export default function DownloadButton({
  href,
  filename,
  sizeBytes,
  size = 'sm',
}: DownloadButtonProps) {
  if (!href) return null;

  const sizeLabel = formatBytes(sizeBytes ?? null);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`download-btn download-btn-${size}`}
      title={filename ? `Descargar ${filename}` : 'Descargar clase'}
    >
      <span className="download-btn-icon" aria-hidden="true">
        ↓
      </span>
      <span className="download-btn-label">
        Descargar
        {sizeLabel && <span className="download-btn-size"> · {sizeLabel}</span>}
      </span>
    </a>
  );
}
