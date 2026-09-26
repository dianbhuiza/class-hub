import { Link } from 'react-router-dom';
import type { ClassItem as ClassItemType } from '../types';
import { formatClassDate, primaryLabel } from '../lib/classFormat';
import { useClassFileInfo } from '../hooks/useClassFileInfo';
import { directUrlFrom, formatBytes } from '../lib/drive';
import DownloadButton from './DownloadButton';

interface ClassItemProps {
  item: ClassItemType;
  index: number;
  subjectId?: string;
}

export default function ClassItem({ item, index, subjectId }: ClassItemProps) {
  const roman = index === 0 ? 'I' : 'II';
  const info = useClassFileInfo(item.id, true);
  const sizeLabel = formatBytes(info?.sizeBytes ?? null);
  const customTitle = item.title?.trim();
  const href = info?.downloadUrl ?? directUrlFrom(item.url);
  const playlistSubjectId = subjectId ?? item.subjects[0]?.subject.id;
  const playlistHref = playlistSubjectId
    ? `/subject/${playlistSubjectId}/playlist?class=${encodeURIComponent(item.id)}`
    : null;

  const body = (
    <>
      <div className="class-item-header">
        <span className="class-item-badge">{roman}</span>
        <span className="class-item-date">{formatClassDate(item.date)}</span>
      </div>
      <h4 className="class-item-title">{primaryLabel(item)}</h4>
      {info?.filename && (
        <p className="class-item-drivefile">
          {info.filename}
          {sizeLabel && <span className="class-item-filesize"> · {sizeLabel}</span>}
        </p>
      )}
      {customTitle && <p className="class-item-subjects">{customTitle}</p>}
      {playlistHref && <span className="class-item-link">Ver en playlist →</span>}
    </>
  );

  return (
    <div className="class-item">
      {playlistHref ? (
        <Link to={playlistHref} className="class-item-body">
          {body}
        </Link>
      ) : (
        <div className="class-item-body">{body}</div>
      )}
      <div className="class-item-footer">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="drive-btn"
          title="Abrir en Google Drive"
        >
          <span className="drive-btn-icon" aria-hidden="true">↗</span>
          <span className="drive-btn-label">Ver en Drive</span>
        </a>
        <DownloadButton
          href={href}
          filename={info?.filename}
          sizeBytes={info?.sizeBytes}
        />
      </div>
    </div>
  );
}
