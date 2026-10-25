'use client';

import { createClient } from '@/lib/supabase/client';
import { MAX_UPLOAD_BYTES, STORAGE_BUCKET } from '@/lib/constants';

const ALLOWED: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm'],
  pdf: ['application/pdf'],
};

/** Uploads a file to the "media" bucket and returns its public address. */
export async function uploadFile(file: File, kind: 'image' | 'audio' | 'pdf', folder: string) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File is too large (${(file.size / 1048576).toFixed(1)} MB). The limit is 50 MB.`);
  }
  if (!ALLOWED[kind].includes(file.type)) {
    throw new Error(`This file type (${file.type || 'unknown'}) is not allowed for ${kind} uploads.`);
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function removeFile(path: string | null | undefined) {
  if (!path) return;
  const supabase = createClient();
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}
