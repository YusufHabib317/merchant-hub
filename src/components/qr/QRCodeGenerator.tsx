import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  margin?: number;
  onGenerate?: ((dataUrl: string) => void) | null;
}

export function QRCodeGenerator({
  value,
  size = 300,
  margin = 2,
  onGenerate = null,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      }).then(() => {
        const generatedUrl = canvasRef.current?.toDataURL('image/png');
        if (generatedUrl && onGenerate) {
          onGenerate(generatedUrl);
        }
      });
    }
  }, [value, size, margin, onGenerate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
}

export function generateQRDataUrl(
  value: string,
  size = 300,
  margin = 2,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(() => {
        resolve(canvas.toDataURL('image/png'));
      })
      .catch(reject);
  });
}
