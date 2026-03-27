import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, spacing, radii, shadows } from '../../../../src/constants/theme';
import { SubPage } from '../../../../src/components/PageLayout';
import { getEditById, getEditImageUrl, getEditsByCollection } from '../../../../src/services/edits.service';
import type { Edit } from '../../../../src/types/database.types';

export default function EditDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [edit, setEdit] = useState<Edit | null>(null);
  const [siblings, setSiblings] = useState<Edit[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const editData = await getEditById(id);
        setEdit(editData);
        if (editData?.image_path) {
          const url = await getEditImageUrl(editData.image_path);
          setImageUrl(url);
        }
        // Fetch sibling edits in same collection for nav
        if (editData?.collection_id) {
          const all = await getEditsByCollection(editData.collection_id);
          setSiblings(all);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const currentIndex = siblings.findIndex((e) => e.id === id);
  const prevEdit = siblings.length > 1
    ? siblings[(currentIndex - 1 + siblings.length) % siblings.length]
    : null;
  const nextEdit = siblings.length > 1
    ? siblings[(currentIndex + 1) % siblings.length]
    : null;

  const navigateTo = (editId: string) => {
    router.replace(`/(tabs)/almira/edit/${editId}`);
  };

  if (loading) {
    return (
      <SubPage title="Edit Details" onBack={() => router.back()}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SubPage>
    );
  }

  if (!edit) {
    return (
      <SubPage title="Edit Details" onBack={() => router.back()}>
        <Text>Edit not found</Text>
      </SubPage>
    );
  }

  return (
    <SubPage title="Edit Details" onBack={() => router.back()}>
      {/* Image Card with Navigation */}
      <View style={styles.imageCard}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>{edit.subtitle}</Text>
          </View>
        )}

        {/* Left Chevron */}
        {prevEdit && (
          <Pressable
            style={[styles.chevron, styles.chevronLeft]}
            onPress={() => navigateTo(prevEdit.id)}
            hitSlop={8}
          >
            <ChevronLeft size={24} color={colors.foreground} />
          </Pressable>
        )}

        {/* Right Chevron */}
        {nextEdit && (
          <Pressable
            style={[styles.chevron, styles.chevronRight]}
            onPress={() => navigateTo(nextEdit.id)}
            hitSlop={8}
          >
            <ChevronRight size={24} color={colors.foreground} />
          </Pressable>
        )}
      </View>

      <View style={{ height: spacing.lg }} />
      <Text style={styles.subtitle}>{edit.subtitle}</Text>
      <Text style={styles.desc}>{edit.description}</Text>
    </SubPage>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  imageCard: {
    position: 'relative',
    height: 350,
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    overflow: 'hidden',
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  chevron: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    padding: spacing.sm,
  },
  chevronLeft: {
    left: 8,
  },
  chevronRight: {
    right: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  desc: {
    fontSize: 15,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
});
