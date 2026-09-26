import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getSubject, getClasses } from '../api';
import type { Subject, ClassItem } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import PlaylistSidebar from '../components/PlaylistSidebar';
import DownloadButton from '../components/DownloadButton';
import { useClassFileInfo } from '../hooks/useClassFileInfo';
import { formatLongDate, primaryLabel } from '../lib/classFormat';
import { directUrlFrom, formatBytes } from '../lib/drive';

export default function Playlist() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialClassId] = useState(() => searchParams.get('class'));
  const [subject, setSubject] = useState<Subject | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [current, setCurrent] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const info = useClassFileInfo(current?.id, Boolean(current));
  const sizeLabel = formatBytes(info?.sizeBytes ?? null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getSubject(id),
      getClasses({ subjectId: id }),
    ]).then(([subj, cls]) => {
      setSubject(subj);
      setClasses(cls);
      const requested = initialClassId
        ? cls.find((c) => c.id === initialClassId)
        : undefined;
      if (cls.length > 0) setCurrent(requested ?? cls[0]);
      setLoading(false);
    });
  }, [id, initialClassId]);

  function handleSelect(cls: ClassItem) {
    setCurrent(cls);
    setSearchParams({ class: cls.id }, { replace: true });
  }

  if (loading) return <div className="loading">Cargando playlist...</div>;
  if (!subject || !current) return <div className="empty">No hay clases disponibles.</div>;

  return (
    <div className="playlist-page">
      <Link to={`/subject/${id}`} className="back-link playlist-back">
        ← Volver a {subject.name}
      </Link>
      <div className="playlist-layout">
        <div className="playlist-main">
          <VideoPlayer key={current.id} url={current.url} />
          <div className="playlist-now-playing">
            <div className="playlist-now-playing-text">
              <h2 className="playlist-title">{primaryLabel(current)}</h2>
              {info?.filename && (
                <p className="playlist-drivefile">
                  {info.filename}
                  {sizeLabel && <span className="playlist-filesize"> · {sizeLabel}</span>}
                </p>
              )}
              <span className="playlist-date">{formatLongDate(current.date)}</span>
            </div>
            <DownloadButton
              href={info?.downloadUrl ?? directUrlFrom(current.url)}
              filename={info?.filename}
              sizeBytes={info?.sizeBytes}
              size="md"
            />
          </div>
        </div>
        <PlaylistSidebar
          classes={classes}
          currentClassId={current.id}
          onSelect={handleSelect}
          subjectName={subject.name}
        />
      </div>
    </div>
  );
}
