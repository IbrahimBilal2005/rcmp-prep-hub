import { supabase } from "@/services/supabase/client";
import { optimizeImageForUpload, withUploadTimeout } from "@/services/storage/image-upload";

const QUESTION_IMAGE_BUCKET = "question-images";
const MAX_QUESTION_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_QUESTION_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SIGNED_URL_CACHE_BUFFER_MS = 60_000;

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export const validateQuestionImageFile = (file: File) => {
  if (!ALLOWED_QUESTION_IMAGE_TYPES.has(file.type)) {
    throw new Error("Question images must be PNG, JPG, or WebP files.");
  }

  if (file.size > MAX_QUESTION_IMAGE_SIZE_BYTES) {
    throw new Error("Question images must be 10 MB or smaller.");
  }
};

export const resolveQuestionAssetUrl = async (path: string | null) => {
  if (!path) {
    return null;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  if (!supabase) {
    return null;
  }

  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt - SIGNED_URL_CACHE_BUFFER_MS > Date.now()) {
    return cached.url;
  }

  const { data, error } = await withUploadTimeout(
    supabase.storage.from(QUESTION_IMAGE_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS),
    "Question image load",
  );

  if (error) {
    console.error("Unable to resolve question image URL", error);
    return null;
  }

  signedUrlCache.set(path, {
    url: data.signedUrl,
    expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
  });

  return data.signedUrl;
};

export const uploadQuestionAsset = async ({
  ownerType,
  ownerId,
  questionId,
  slot,
  file,
  previousPath,
}: {
  ownerType: "module" | "test";
  ownerId: number;
  questionId: number;
  slot: string;
  file: File;
  previousPath?: string | null;
}) => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  validateQuestionImageFile(file);
  const uploadFile = await withUploadTimeout(optimizeImageForUpload(file), "Image optimization");
  validateQuestionImageFile(uploadFile);

  const fileName = sanitizeFileName(uploadFile.name || `question-image-${Date.now()}`);
  const storagePath = `${ownerType}-${ownerId}/question-${questionId}/${slot}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await withUploadTimeout(supabase.storage.from(QUESTION_IMAGE_BUCKET).upload(storagePath, uploadFile, {
    upsert: true,
    contentType: uploadFile.type || undefined,
  }), "Question image upload");

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  if (previousPath && !isAbsoluteUrl(previousPath) && previousPath !== storagePath) {
    signedUrlCache.delete(previousPath);
    const { error: removeError } = await supabase.storage.from(QUESTION_IMAGE_BUCKET).remove([previousPath]);

    if (removeError) {
      console.error("Unable to remove previous question image", removeError);
    }
  }

  signedUrlCache.delete(storagePath);
  return storagePath;
};

export const removeQuestionAsset = async (currentPath: string | null) => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  if (!currentPath || isAbsoluteUrl(currentPath)) {
    return;
  }

  signedUrlCache.delete(currentPath);
  const { error } = await supabase.storage.from(QUESTION_IMAGE_BUCKET).remove([currentPath]);

  if (error) {
    throw new Error(error.message);
  }
};

export const questionAssetBucket = QUESTION_IMAGE_BUCKET;
