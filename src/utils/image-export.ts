/* eslint-disable no-plusplus */
import { toPng } from 'html-to-image';

const BROKEN_IMAGE_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+xU9EAAAAASUVORK5CYII=';

export interface ExportOptions {
  quality?: number;
  pixelRatio?: number;
  backgroundColor?: string;
  cacheBust?: boolean;
  imagePlaceholder?: string;
}

/**
 * Convert an image URL to a data URL (base64) using a server-side proxy
 * to avoid CORS issues with external image hosts
 */
async function imageToDataUrl(url: string): Promise<string | null> {
  try {
    // Use server-side proxy to bypass CORS
    const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Preload all images in an element and convert external URLs to data URLs
 * to ensure they're properly embedded in the exported image
 */
async function preloadImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img');

  // Convert external images to data URLs to avoid CORS issues
  const conversionPromises = Array.from(images).map(async (img) => {
    const { src } = img;

    // Skip if already a data URL or empty
    if (!src || src.startsWith('data:')) {
      return;
    }

    try {
      const dataUrl = await imageToDataUrl(src);
      if (dataUrl) {
        // eslint-disable-next-line no-param-reassign
        img.src = dataUrl;
      }
    } catch {
      // Keep original src if conversion fails
    }
  });

  await Promise.all(conversionPromises);

  // Wait for all images to load
  const imagePromises = Array.from(images).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          // eslint-disable-next-line no-param-reassign
          img.onload = () => resolve();
          // eslint-disable-next-line no-param-reassign
          img.onerror = () => resolve(); // Resolve even on error to not block export
        }
      })
  );

  await Promise.all(imagePromises);
  // Add a delay to ensure rendering is complete
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
}

export async function exportToImage(
  element: HTMLElement,
  options?: ExportOptions
): Promise<string> {
  const {
    quality = 1,
    pixelRatio = 2,
    backgroundColor,
    // NOTE:
    // `html-to-image` implements cache busting by appending a query param to image URLs.
    // For signed / tokenized image URLs (common with upload providers), this can break the signature
    // and the exported PNG will miss product images. Default to `false` for reliability.
    cacheBust = false,
    imagePlaceholder,
  } = options || {};

  try {
    // Preload all images before export
    await preloadImages(element);

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

export function getImageDimensions(element: HTMLElement): { width: number; height: number } {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}
