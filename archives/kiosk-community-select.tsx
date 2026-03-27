import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator,
  ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Navigation, Check } from 'lucide-react-native';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { useBooking } from '../../../src/contexts/BookingContext';
import { useToast } from '../../../src/contexts/ToastContext';
import { getCommunities, subscribeToCommunities } from '../../../src/services/kiosk.service';
import { getAddresses } from '../../../src/services/address.service';
import type { CommunityRow } from '../../../src/types/database.types';

/* ── Rough locality centers for distance sorting ─── */
const LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Kondapur:       { lat: 17.4637, lng: 78.3522 },
  Kothaguda:      { lat: 17.4590, lng: 78.3650 },
  Nallagandla:    { lat: 17.4580, lng: 78.3100 },
  Serilingampally:{ lat: 17.4560, lng: 78.3000 },
  Tellapur:       { lat: 17.4650, lng: 78.2900 },
  Gachibowli:     { lat: 17.4400, lng: 78.3489 },
  Nanakramguda:   { lat: 17.4230, lng: 78.3680 },
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CommunityScreen() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const { showToast } = useToast();
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLocality, setActiveLocality] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isOther, setIsOther] = useState(false);
  const [otherCommunity, setOtherCommunity] = useState('');

  const selected = communities.find((c) => c.id === state.selectedCommunityId);

  // ── Load communities + auto-match address in one go ──
  useEffect(() => {
    let channel: any;
    (async () => {
      try {
        const [comms, addrs] = await Promise.all([getCommunities(), getAddresses()]);
        setCommunities(comms);
        channel = subscribeToCommunities(setCommunities);

        // Try auto-match from saved address
        const def = addrs.find((a) => a.is_default) || addrs[0];
        if (def?.landmark && comms.length > 0) {
          const match = comms.find(
            (c) => c.name.toLowerCase() === def.landmark!.toLowerCase(),
          );
          if (match) {
            dispatch({
              type: 'SELECT_COMMUNITY',
              communityId: match.id,
              communityName: match.name,
              date: match.planned_date || '',
              time: match.time_range || '',
            });
            // Skip straight to services — no flash
            router.replace('/(tabs)/kiosk/services' as any);
            return;
          }
        }
      } catch {
        showToast('Failed to load communities');
      } finally {
        setLoading(false);
      }
    })();
    return () => { channel?.unsubscribe(); };
  }, []);

  // ── Geolocation ──
  useEffect(() => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: false, timeout: 5000 },
      );
    }
  }, []);

  // ── Derive localities sorted by distance ──
  const localities = useMemo(() => {
    const set = new Set<string>();
    communities.forEach((c) => { if (c.location) set.add(c.location); });
    let arr = Array.from(set);
    if (userCoords) {
      arr.sort((a, b) => {
        const aKey = Object.keys(LOCALITY_COORDS).find((k) => k.toLowerCase() === a.toLowerCase());
        const bKey = Object.keys(LOCALITY_COORDS).find((k) => k.toLowerCase() === b.toLowerCase());
        const aDist = aKey ? haversine(userCoords.lat, userCoords.lng, LOCALITY_COORDS[aKey].lat, LOCALITY_COORDS[aKey].lng) : 999;
        const bDist = bKey ? haversine(userCoords.lat, userCoords.lng, LOCALITY_COORDS[bKey].lat, LOCALITY_COORDS[bKey].lng) : 999;
        return aDist - bDist;
      });
    }
    return arr;
  }, [communities, userCoords]);

  // ── Auto-select nearest locality ──
  useEffect(() => {
    if (localities.length > 0 && !activeLocality) {
      setActiveLocality(localities[0]);
    }
  }, [localities]);

  const filteredCommunities = useMemo(() =>
    activeLocality
      ? communities.filter((c) => c.location?.toLowerCase() === activeLocality.toLowerCase())
      : communities,
    [communities, activeLocality],
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const selectCommunity = (c: CommunityRow) => {
    dispatch({
      type: 'SELECT_COMMUNITY',
      communityId: c.id,
      communityName: c.name,
      date: c.planned_date || '',
      time: c.time_range || '',
    });
    setIsOther(false);
    setOtherCommunity('');
  };

  const handleContinue = () => {
    if (!state.selectedCommunityId && !isOther) {
      showToast('Please select a community');
      return;
    }
    if (isOther && !otherCommunity.trim()) {
      showToast('Please enter your community name');
      return;
    }
    if (isOther) {
      dispatch({ type: 'SET_CUSTOM_COMMUNITY', name: otherCommunity.trim() });
    }
    router.push('/(tabs)/kiosk/services' as any);
  };

  if (loading) {
    return (
      <SubPage title="Select Community" onBack={() => router.push('/(tabs)')}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SubPage>
    );
  }

  return (
    <SubPage
      title="Select Community"
      onBack={() => router.push('/(tabs)')}
      actionLabel="Continue"
      onAction={handleContinue}
    >
      {/* Location hint */}
      {userCoords && (
        <View style={styles.locationHint}>
          <Navigation size={13} color={colors.primary} />
          <Text style={styles.locationHintText}>Showing areas near you</Text>
        </View>
      )}

      {/* Locality chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {localities.map((loc) => {
          const isActive = activeLocality === loc;
          return (
            <Pressable
              key={loc}
              onPress={() => setActiveLocality(loc)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {loc}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Community cards */}
      {filteredCommunities.map((c) => {
        const isSel = c.id === state.selectedCommunityId;
        return (
          <Pressable
            key={c.id}
            onPress={() => selectCommunity(c)}
            style={[styles.communityCard, isSel && styles.communityCardSelected]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.communityName} numberOfLines={1}>{c.name}</Text>
              {isSel && (
                <View style={styles.checkCircle}>
                  <Check size={14} color={colors.primaryForeground} strokeWidth={3} />
                </View>
              )}
            </View>

            <View style={styles.cardMeta}>
              {c.planned_date && (
                <View style={styles.metaChip}>
                  <Calendar size={12} color={colors.mutedForeground} />
                  <Text style={styles.metaText}>{formatDate(c.planned_date)}</Text>
                </View>
              )}
              {c.time_range && (
                <View style={styles.metaChip}>
                  <Clock size={12} color={colors.mutedForeground} />
                  <Text style={styles.metaText}>{c.time_range}</Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}

      {filteredCommunities.length === 0 && (
        <View style={styles.emptyWrap}>
          <MapPin size={28} color={colors.border} />
          <Text style={styles.emptyText}>No communities in this area yet</Text>
        </View>
      )}

      {/* Other option */}
      <View style={styles.divider} />
      <Pressable
        onPress={() => { setIsOther(!isOther); if (!isOther) dispatch({ type: 'SET_CUSTOM_COMMUNITY', name: '' }); }}
        style={[styles.otherCard, isOther && styles.otherCardSelected]}
      >
        <MapPin size={16} color={isOther ? colors.primary : colors.mutedForeground} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.otherLabel, isOther && { color: colors.foreground }]}>
            My community isn't listed
          </Text>
        </View>
      </Pressable>

      {isOther && (
        <TextInput
          style={styles.otherInput}
          placeholder="Enter your community name"
          placeholderTextColor={colors.mutedForeground}
          value={otherCommunity}
          onChangeText={setOtherCommunity}
          autoFocus
        />
      )}
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

  // Location hint
  locationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationHintText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },

  // Chips
  chipScroll: {
    marginBottom: 16,
    marginHorizontal: -4,
  },
  chipContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  chipTextActive: {
    color: colors.primaryForeground,
  },

  // Community cards
  communityCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  communityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedBg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  communityName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontWeight: '500',
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  // Other
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  otherCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedBg,
  },
  otherLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  otherInput: {
    backgroundColor: colors.searchSurface,
    borderRadius: radii.xl,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 4,
    outlineStyle: 'none',
  } as any,
});
