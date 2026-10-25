export const CATEGORIES = [
  'ghazal',
  'nazam',
  'tappa',
  'rubai',
  'charbeta',
  'landay',
  'marsia',
  'naat',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];
export const isCategory = (v: unknown): v is Category => CATEGORIES.includes(v as Category);

export const MEDIA_KINDS = ['audio', 'image', 'video', 'pdf'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const PAGE_SIZE = 24;
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase free plan limit)
export const STORAGE_BUCKET = 'media';

export const SETTING_KEYS = [
  'dev_name_ps',
  'dev_name_pr',
  'dev_name_en',
  'dev_bio_ps',
  'dev_bio_pr',
  'dev_bio_en',
  'dev_photo_url',
  'couplet_override_id',
  'featured_poet_id',
] as const;
