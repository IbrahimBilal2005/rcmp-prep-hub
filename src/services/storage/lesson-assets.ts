import { supabase } from "@/services/supabase/client";

export type LessonAssetKind = "video" | "poster";

const LESSON_VIDEO_BUCKET = "lesson-videos";
const LESSON_POSTER_BUCKET = "lesson-posters";
const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;
const MAX_POSTER_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED_POSTER_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const getBucketName = (kind: LessonAssetKind) =>
  kind === "video" ? LESSON_VIDEO_BUCKET : LESSON_POSTER_BUCKET;

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export const validateLessonAssetFile = (kind: LessonAssetKind, file: File) => {
  if (kind === "video") {
    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      throw new Error("Video uploads must be MP4, WebM, or MOV files.");
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      throw new Error("Video uploads must be 500 MB or smaller.");
    }
  }

  if (kind === "poster") {
    if (!ALLOWED_POSTER_TYPES.has(file.type)) {
      throw new Error("Poster uploads must be PNG, JPG, or WebP files.");
    }

    if (file.size > MAX_POSTER_SIZE_BYTES) {
      throw new Error("Poster uploads must be 10 MB or smaller.");
    }
  }
};

export const resolveLessonAssetUrl = async (kind: LessonAssetKind, path: string | null) => {
  if (!path) {
    return null;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage.from(getBucketName(kind)).createSignedUrl(path, 60 * 60);

  if (error) {
    console.error(`Unable to resolve ${kind} asset URL`, error);
    return null;
  }

  return data.signedUrl;
};

export const uploadLessonAsset = async ({
  moduleId,
  lessonId,
  file,
  kind,
  previousPath,
}: {
  moduleId: number;
  lessonId: number;
  file: File;
  kind: LessonAssetKind;
  previousPath?: string | null;
}) => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  validateLessonAssetFile(kind, file);

  const bucket = getBucketName(kind);
  const fileName = sanitizeFileName(file.name || `${kind}-${Date.now()}`);
  const storagePath = `module-${moduleId}/lesson-${lessonId}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const column = kind === "video" ? "video_path" : "poster_path";
  const { error: updateError } = await supabase.from("lessons").update({ [column]: storagePath }).eq("id", lessonId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (previousPath && !isAbsoluteUrl(previousPath) && previousPath !== storagePath) {
    const { error: removeError } = await supabase.storage.from(bucket).remove([previousPath]);

    if (removeError) {
      console.error(`Unable to remove previous ${kind} asset`, removeError);
    }
  }

  return storagePath;
};

export const removeLessonAsset = async ({
  lessonId,
  kind,
  currentPath,
}: {
  lessonId: number;
  kind: LessonAssetKind;
  currentPath: string | null;
}) => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  const bucket = getBucketName(kind);
  const column = kind === "video" ? "video_path" : "poster_path";

  const { error: updateError } = await supabase.from("lessons").update({ [column]: null }).eq("id", lessonId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (currentPath && !isAbsoluteUrl(currentPath)) {
    const { error: removeError } = await supabase.storage.from(bucket).remove([currentPath]);

    if (removeError) {
      throw new Error(removeError.message);
    }
  }
};

export const lessonAssetBuckets = {
  video: LESSON_VIDEO_BUCKET,
  poster: LESSON_POSTER_BUCKET,
} as const;
