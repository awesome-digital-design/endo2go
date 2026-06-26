// Cap the longest edge so requests stay well under Vercel's ~4.5MB body limit.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

// Read a selected file and return a downscaled JPEG data URL ready for storage.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      downscaleDataUrl(reader.result as string).then(resolve, reject);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Draw the image to a canvas with the longest side capped at MAX_DIMENSION and
// re-encode as JPEG. Falls back to the original data URL if the canvas is
// unavailable (e.g. exotic browsers); rejects only if the image can't decode.
export function downscaleDataUrl(
  dataUrl: string,
  maxDimension = MAX_DIMENSION,
  quality = JPEG_QUALITY,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const longest = Math.max(img.width, img.height);
      const scale = longest > maxDimension ? maxDimension / longest : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () =>
      reject(new Error("Could not load image for downscaling."));
    img.src = dataUrl;
  });
}
