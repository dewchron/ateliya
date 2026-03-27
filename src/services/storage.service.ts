import { supabase } from '../lib/supabase';

export async function uploadPhoto(
  bucket: 'item-photos' | 'edit-images',
  filePath: string,
  file: Blob | ArrayBuffer,
  contentType = 'image/jpeg'
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { contentType, upsert: true });

  if (error) throw error;
  return data.path;
}

export async function getPhotoUrl(
  bucket: 'item-photos' | 'edit-images',
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function deletePhoto(
  bucket: 'item-photos' | 'edit-images',
  paths: string[]
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);
  if (error) throw error;
}
