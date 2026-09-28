import type { ClassItem as ClassItemType, ClassLink } from '../types';
import { formatClassDate, primaryLabel } from '../lib/classFormat';
import { useClassFileInfo } from '../hooks/useClassFileInfo';
import { directUrlFrom, formatBytes } from '../lib/drive';
import DownloadButton from './DownloadButton';

interface ClassItemProps {
  item: ClassItemType;
  index: number;
}

function groupLinks(item: ClassItemType, links: ClassLink[]) {
  const groups = item.subjects
    .map((cs) => ({
      name: cs.subject.name,
      links: links.filter((link) => link.subjectId === cs.subject.id),
    }))
    .filter((group) => group.links.length > 0);

  const rest = links.filter(
    (link) =>
      !link.subjectId ||
      !item.subjects.some((cs) => cs.subject.id === link.subjectId),
  );

  if (rest.length > 0) {
    groups.push({ name: 'Sin asignatura', links: rest });
  }

  return groups;
}

export default function ClassItem({ item, index }: ClassItemProps) {
  const roman = index === 0 ? 'I' : 'II';
  const info = useClassFileInfo(item.id, true);
  const sizeLabel = formatBytes(info?.sizeBytes ?? null);
  const customTitle = item.title?.trim();
  const href = info?.downloadUrl ?? directUrlFrom(item.url);
  const links = item.links ?? [];
  const linkGroups = groupLinks(item, links);

  const renderLink = (link: ClassLink) => (
    <li key={link.id}>
      <a
        className="class-link"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        title={link.url}
      >
        <span className="class-link-icon" aria-hidden="true">↗</span>
        <span className="class-link-title">{link.title}</span>
      </a>
    </li>
  );

  return (
    <div className="class-item">
      <div className="class-item-body">
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
      </div>
      {links.length > 0 && (
        <div className="class-item-links">
          <span className="class-item-links-label">Links relacionados</span>
          {linkGroups.length > 1 ? (
            linkGroups.map((group, groupIndex) => (
              <div className="class-link-group" key={`${group.name}-${groupIndex}`}>
                <span className="class-link-group-title">{group.name}</span>
                <ul className="class-links">{group.links.map(renderLink)}</ul>
              </div>
            ))
          ) : (
            <ul className="class-links">{links.map(renderLink)}</ul>
          )}
        </div>
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
          contentType={info?.contentType}
        />
      </div>
    </div>
  );
}
