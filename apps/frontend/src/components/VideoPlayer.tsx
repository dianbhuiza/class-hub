import { previewUrlFrom } from '../lib/drive';
import { isAppleTouchDevice } from '../lib/platform';

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const previewUrl = previewUrlFrom(url);

  if (!previewUrl) {
    return (
      <div className="video-player-error">
        <p>No se pudo cargar el video.</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Abrir en Google Drive →
        </a>
      </div>
    );
  }

  // Safari/iOS: el iframe de Drive no reproduce de forma estable y WebKit no
  // deja ponerlo en pantalla completa. Se abre el reproductor de Drive en otra
  // pestana, donde si funciona (y con su propio control de pantalla completa).
  if (isAppleTouchDevice()) {
    return (
      <div className="video-player">
        <a
          className="video-player-open"
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="video-player-open-icon" aria-hidden="true">
            ▶
          </span>
          <span className="video-player-open-label">Ver en Google Drive</span>
          <span className="video-player-open-hint">
            Se abre el reproductor de Drive en una pestaña nueva
          </span>
        </a>
      </div>
    );
  }

  return (
    <div className="video-player">
      <iframe
        key={previewUrl}
        src={previewUrl}
        title="Reproductor de la clase"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
