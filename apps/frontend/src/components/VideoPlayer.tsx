import { previewUrlFrom } from '../lib/drive';

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
