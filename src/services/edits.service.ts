import { supabase } from '../lib/supabase';
import type { EditCollection, Edit } from '../types/database.types';
import { getPhotoUrl } from './storage.service';

export async function getLiveCollection(): Promise<
  (EditCollection & { edits: Edit[] }) | null
> {
  const { data, error } = await supabase
    .from('edit_collections')
    .select('*, edits(*)')
    .eq('status', 'live')
    .order('publish_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (data && data.edits) {
    // Sort edits by sort_order
    data.edits.sort((a: Edit, b: Edit) => a.sort_order - b.sort_order);
  }

  return data;
}

export async function getArchives(): Promise<EditCollection[]> {
  const { data, error } = await supabase
    .from('edit_collections')
    .select('*')
    .eq('status', 'archived')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getArchivesByYear(): Promise<
  Record<number, EditCollection[]>
> {
  const archives = await getArchives();
  const grouped: Record<number, EditCollection[]> = {};
  for (const collection of archives) {
    if (!grouped[collection.year]) grouped[collection.year] = [];
    grouped[collection.year].push(collection);
  }
  return grouped;
}

export async function getEditsByCollection(collectionId: string): Promise<Edit[]> {
  const { data, error } = await supabase
    .from('edits')
    .select('*')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getEditById(editId: string): Promise<Edit | null> {
  const { data, error } = await supabase
    .from('edits')
    .select('*')
    .eq('id', editId)
    .single();

  if (error) throw error;
  return data;
}

export async function getEditImageUrl(imagePath: string | null): Promise<string | null> {
  if (!imagePath) return null;
  return getPhotoUrl('edit-images', imagePath);
}
