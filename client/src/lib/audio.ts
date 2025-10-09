export const durationCache = new Map<string, number>();

export async function fetchTrackDuration(trackId: string): Promise<number> {
  if (durationCache.has(trackId)) return durationCache.get(trackId) as number;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const url = `${baseUrl}/tracks/${trackId}/stream`;

  const resp = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!resp.ok) throw new Error(`Failed to fetch stream: ${resp.status}`);

  const blob = await resp.blob();
  const objectUrl = URL.createObjectURL(blob);

  const audio = document.createElement('audio');
  audio.src = objectUrl;

  const duration = await new Promise<number>((resolve, reject) => {
    const onLoaded = () => {
      resolve(isFinite(audio.duration) ? audio.duration : 0);
      cleanup();
    };
    const onError = () => {
      reject(new Error('failed to read audio metadata'));
      cleanup();
    };
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
      URL.revokeObjectURL(objectUrl);
    };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
  });

  const rounded = Math.max(0, Math.round(duration));
  durationCache.set(trackId, rounded);
  return rounded;
}
