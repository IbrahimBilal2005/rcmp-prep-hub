const IMAGE_UPLOAD_TIMEOUT_MS = 45_000;
const IMAGE_OPTIMIZE_THRESHOLD_BYTES = 1.5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1800;
const WEBP_QUALITY = 0.86;

const IMAGE_EXTENSION_PATTERN = /\.[a-z0-9]+$/i;

const isBrowserImageType = (type: string) =>
  type === "image/png" || type === "image/jpeg" || type === "image/webp";

const replaceFileExtension = (name: string, extension: string) => {
  const fallbackName = `image-${Date.now()}`;
  const baseName = (name || fallbackName).replace(IMAGE_EXTENSION_PATTERN, "") || fallbackName;
  return `${baseName}.${extension}`;
};

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read the selected image. Try exporting it as a fresh PNG, JPG, or WebP file."));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Unable to optimize this image before upload."));
      },
      type,
      quality,
    );
  });

export const optimizeImageForUpload = async (file: File) => {
  if (!isBrowserImageType(file.type) || file.size < IMAGE_OPTIMIZE_THRESHOLD_BYTES) {
    return file;
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const optimizedBlob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  if (optimizedBlob.size >= file.size) {
    return file;
  }

  return new File([optimizedBlob], replaceFileExtension(file.name, "webp"), {
    type: "image/webp",
    lastModified: Date.now(),
  });
};

export const withUploadTimeout = async <T>(operation: Promise<T>, label = "Upload") => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out. Check your connection, try a smaller image, or try again in a moment.`));
    }, IMAGE_UPLOAD_TIMEOUT_MS);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};
