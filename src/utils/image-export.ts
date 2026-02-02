/* eslint-disable no-plusplus */
import { toPng } from 'html-to-image';

// Fallback image used when a product image fails to load or is blocked by CORS.
// This prevents html-to-image from throwing opaque "oops, something went wrong"
// errors when encountering broken <img> elements inside the export area.
const BROKEN_IMAGE_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+xU9EAAAAASUVORK5CYII=';

export interface ExportOptions {
  quality?: number;
  pixelRatio?: number;
  backgroundColor?: string;
  cacheBust?: boolean;
  imagePlaceholder?: string;
}

export async function exportToImage(
  element: HTMLElement,
  options?: ExportOptions,
): Promise<string> {
  const {
    quality = 1,
    pixelRatio = 2,
    backgroundColor,
    cacheBust = true,
    imagePlaceholder,
  } = options || {};

  try {
    return await toPng(element, {
      quality,
      pixelRatio,
      backgroundColor: backgroundColor || undefined,
      cacheBust,
      imagePlaceholder: imagePlaceholder || BROKEN_IMAGE_PLACEHOLDER,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[image-export] Failed to export element to image', error);
    throw error;
  }
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function getImageFilename(prefix: string, extension: 'png' | 'jpg' = 'png'): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}.${extension}`;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function shareImage(dataUrl: string, title: string): Promise<void> {
  if (navigator.share) {
    try {
      const blob = dataUrlToBlob(dataUrl);
      const file = new File([blob], `${title}.png`, { type: 'image/png' });
      await navigator.share({
        title,
        text: `Check out my products from ${title}!`,
        files: [file],
      });
    } catch {
      downloadImage(dataUrl, `${title}.png`);
    }
  } else {
    downloadImage(dataUrl, `${title}.png`);
  }
}

export function getImageDimensions(
  element: HTMLElement,
): { width: number; height: number } {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}
