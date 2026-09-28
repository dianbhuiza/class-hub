import { formatBytes } from '../lib/drive';

interface DownloadButtonProps {
  href: string | null;
  filename?: string | null;
  sizeBytes?: number | null;
  contentType?: string | null;
  size?: 'sm' | 'md';
}

export default function DownloadButton({
  href,
  filename,
  sizeBytes,
  contentType,
  size = 'sm',
}: DownloadButtonProps) {
  if (!href) return null;

  const sizeLabel = formatBytes(sizeBytes ?? null);
  const servesHtml = Boolean(contentType?.startsWith('text/html'));
  const newTab = servesHtml ? '_blank' : undefined;

  return (
    <a
      href={href}
      target={newTab}
      rel={newTab ? 'noopener noreferrer' : undefined}
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
