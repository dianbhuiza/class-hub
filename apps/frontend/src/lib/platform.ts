// Safari (iOS/iPadOS) y todos los navegadores de Apple con touch: el motor es
// WebKit, que no permite pantalla completa a un <iframe> y con el reproductor
// embebido de Drive el video se reinicia. Ahi se muestra un acceso directo a
// Drive en vez del iframe.
export function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ se reporta como Mac, pero sigue siendo WebKit con touch.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}
