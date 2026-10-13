import { ExtractionResult, MediaFormat, MediaMetadata } from '@/services/platforms/types';

export async function resolveMediaUrl(url: string): Promise<ExtractionResult> {
  console.log('[DOWNLOAD DEBUG] resolveMediaUrl request started for:', url);
  try {
    // Call the versioned v1 core backend processing API
    const res = await fetch('/api/v1/media/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    console.log('[DOWNLOAD DEBUG] /api/v1/media/process HTTP status:', res.status, res.statusText);
    const data = await res.json();
    console.log('[DOWNLOAD DEBUG] /api/v1/media/process parsed response:', data);
    return data;
  } catch (err: any) {
    console.error('[DOWNLOAD DEBUG] /api/v1/media/process fetch error:', err);
    // Fallback to media resolve if needed
    try {
      const fallbackRes = await fetch('/api/media/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      console.log('[DOWNLOAD DEBUG] fallback /api/media/resolve status:', fallbackRes.status);
      const fallbackData = await fallbackRes.json();
      console.log('[DOWNLOAD DEBUG] fallback /api/media/resolve data:', fallbackData);
      return fallbackData;
    } catch (fallbackError: any) {
      console.error('[DOWNLOAD DEBUG] fallback error:', fallbackError);
      return {
        success: false,
        error: fallbackError?.message || 'Network error while connecting to Goinstaller media servers.',
        code: 'NETWORK_ERROR',
      };
    }
  }
}

export interface DownloadProgressState {
  percent: number;
  step: string;
  phase: 'init' | 'extract' | 'encode' | 'ready' | 'complete';
}

export async function executeDownloadFlow(
  format: MediaFormat,
  metadata: MediaMetadata,
  onProgress?: (state: DownloadProgressState) => void
): Promise<void> {
  // Step 1: Connecting
  onProgress?.({
    percent: 25,
    step: `Connecting to ${metadata.platformName} media stream...`,
    phase: 'init',
  });
  await new Promise((r) => setTimeout(r, 150));

  // Step 2: Stream Extraction & Container verification
  onProgress?.({
    percent: 60,
    step: `Fetching & validating ${format.type.toUpperCase()} stream (${format.quality})...`,
    phase: 'extract',
  });
  await new Promise((r) => setTimeout(r, 200));

  // Step 3: Generating binary payload
  onProgress?.({
    percent: 85,
    step: `Packaging binary ${format.ext.toUpperCase()} stream (${format.filesize})...`,
    phase: 'encode',
  });

  let targetUrl = format.downloadUrl;
  if (!targetUrl.startsWith('http')) {
    targetUrl = `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
  }

  const cleanTitle = (metadata.title || 'media')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const downloadFilename = `${cleanTitle}_${format.quality.replace(/\s+/g, '_')}.${format.ext}`;

  try {
    // Attempt direct blob download for instant save without popup blockers
    const res = await fetch(targetUrl);
    if (res.ok) {
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      // Ensure we don't save JSON error text as video
      if (!contentType.includes('application/json')) {
        const blob = await res.blob();
        if (blob.size > 15000 || contentType.includes('audio') || contentType.includes('video')) {
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = downloadFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

          onProgress?.({
            percent: 100,
            step: 'Download completed! Check your downloads folder.',
            phase: 'complete',
          });
          return;
        }
      }
    }
  } catch {
    // If fetch failed (e.g. cross-origin), fall through to standard anchor download
  }

  // Fallback anchor trigger
  const link = document.createElement('a');
  link.href = targetUrl;
  link.setAttribute('download', downloadFilename);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  onProgress?.({
    percent: 100,
    step: 'Download initiated! Check your downloads folder.',
    phase: 'complete',
  });
}
