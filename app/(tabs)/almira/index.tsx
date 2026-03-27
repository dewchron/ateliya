import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, radii, shadows } from '../../../src/constants/theme';
import { TabPage } from '../../../src/components/PageLayout';
import { getLiveCollection, getArchivesByYear, getEditImageUrl } from '../../../src/services/edits.service';
import type { EditCollection, Edit } from '../../../src/types/database.types';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AlmiraScreen() {
  const router = useRouter();
  const [collection, setCollection] = useState<(EditCollection & { edits: Edit[] }) | null>(null);
  const [archives, setArchives] = useState<Record<number, EditCollection[]>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [live, arch] = await Promise.all([
          getLiveCollection(),
          getArchivesByYear(),
        ]);
        setCollection(live);
        setArchives(arch);

        // Resolve image URLs for live edits
        if (live?.edits) {
          const urls: Record<string, string> = {};
          await Promise.all(
            live.edits.map(async (edit) => {
              if (edit.image_path) {
                const url = await getEditImageUrl(edit.image_path);
                if (url) urls[edit.id] = url;
              }
            })
          );
          setImageUrls(urls);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <TabPage>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </TabPage>
    );
  }

  const archiveYears = Object.keys(archives)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <TabPage>
      {/* Live collection */}
      {collection && (
        <View style={styles.grid}>
          {/* Intro Card */}
          <View style={styles.introCard}>
            <Text style={styles.introLabel}>
              {MONTH_NAMES[collection.month]} Edits
            </Text>
            <Text style={styles.introTitle}>{collection.theme}</Text>
          </View>

          {/* Edit Cards */}
          {collection.edits.map((edit) => (
            <Pressable
              key={edit.id}
              onPress={() => router.push(`/(tabs)/almira/edit/${edit.id}`)}
              style={({ pressed }) => [styles.editCard, pressed && styles.pressed]}
            >
              {imageUrls[edit.id] ? (
                <Image
                  source={{ uri: imageUrls[edit.id] }}
                  style={styles.editImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.editPlaceholder}>
                  <Text style={styles.editPlaceholderText}>{edit.subtitle}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Archives */}
      {archiveYears.length > 0 && (
        <View style={styles.archivesSection}>
          <Text style={styles.archivesTitle}>Archives</Text>
          {archiveYears.map((year) => (
            <View key={year} style={styles.archiveYear}>
              <Text style={styles.archiveYearLabel}>{year}</Text>
              <View style={styles.archiveMonths}>
                {archives[year].map((col) => (
                  <Pressable
                    key={col.id}
                    onPress={() => router.push(`/(tabs)/almira/edit/${col.id}?archive=true`)}
                    style={({ pressed }) => [
                      styles.archiveMonth,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={styles.archiveMonthText}>
                      {MONTH_NAMES[col.month]}
                    </Text>
                    <ChevronRight size={16} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </TabPage>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  introCard: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 200,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    ...shadows.card,
  },
  introLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
  },
  editCard: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 200,
    borderRadius: radii.lg,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  editImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  editPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  editPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },

  // Archives
  archivesSection: {
    marginTop: spacing.xxxl,
  },
  archivesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.lg,
  },
  archiveYear: {
    marginBottom: spacing.xl,
  },
  archiveYearLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  archiveMonths: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  archiveMonth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  archiveMonthText: {
    fontSize: 15,
    color: colors.foreground,
  },
});
