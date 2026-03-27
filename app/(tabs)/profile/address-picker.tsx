import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Navigation, Home, MapPin } from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../../src/constants/theme';
import { MobileContainer } from '../../../src/components/MobileContainer';
import { getAddresses, upsertAddress } from '../../../src/services/address.service';
import { getCommunities } from '../../../src/services/community.service';
import { useToast } from '../../../src/contexts/ToastContext';
import type { Address, CommunityRow } from '../../../src/types/database.types';

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
const DEFAULT_CENTER = { lat: 17.4637, lng: 78.3522 };

function loadGoogleMaps(): Promise<typeof google> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps) { resolve((window as any).google); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places&v=weekly`;
    script.async = true;
    script.onload = () => resolve((window as any).google);
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

interface PendingAddress {
  landmark: string;
  address_line: string;
  city: string;
  pin_code: string;
}

export default function AddressPickerScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);

  // Apartment number step
  const [pending, setPending] = useState<PendingAddress | null>(null);
  const [aptNumber, setAptNumber] = useState('');
  const [landmarkText, setLandmarkText] = useState('');
  const [saving, setSaving] = useState(false);

  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    getAddresses().then(setAddresses).catch(() => {});
    getCommunities().then(setCommunities).catch(() => {});

    if (Platform.OS === 'web') {
      loadGoogleMaps().then((goog) => {
        autocompleteRef.current = new goog.maps.places.AutocompleteService();
        const div = document.createElement('div');
        placesRef.current = new goog.maps.places.PlacesService(div);
      }).catch(() => {});
    }
  }, []);

  const onSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.trim().length < 2 || !autocompleteRef.current) {
      setPredictions([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      autocompleteRef.current!.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: 'in' },
          locationBias: new google.maps.Circle({ center: DEFAULT_CENTER, radius: 30000 }),
        },
        (preds, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
            setPredictions(preds);
          } else {
            setPredictions([]);
          }
        },
      );
    }, 300);
  }, []);

  // Pick a prediction → show apartment number step
  const pickPrediction = useCallback((prediction: any) => {
    if (!placesRef.current) return;
    placesRef.current.getDetails(
      { placeId: prediction.place_id, fields: ['geometry', 'name', 'formatted_address'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return;
        const pName = place.name || '';
        const pAddr = place.formatted_address || '';
        const match = communities.find(
          (c) => c.name.toLowerCase() === pName.toLowerCase(),
        );
        setPending({
          landmark: pName,
          address_line: pAddr,
          city: match?.city || '',
          pin_code: match?.pincode || '',
        });
        setPredictions([]);
        setSearchText('');
        setAptNumber('');
        setLandmarkText('');
      },
    );
  }, [communities]);

  // Confirm address with apartment number
  const confirmAddress = async () => {
    if (!pending) return;
    setSaving(true);
    const existing = addresses.find((a) => a.is_default) || addresses[0];
    const addressLine = aptNumber.trim()
      ? `${aptNumber.trim()}, ${pending.landmark}`
      : pending.landmark;
    try {
      await upsertAddress({
        id: existing?.id,
        address_line: addressLine,
        city: pending.address_line,
        pin_code: pending.pin_code,
        landmark: landmarkText.trim() || undefined,
        is_default: true,
      });
      showToast('Address saved');
      setPending(null);
      router.replace('/(tabs)');
    } catch (err: any) {
      showToast(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  // Select a saved address → make it default & go home
  const selectSaved = async (addr: Address) => {
    if (addr.is_default) {
      router.replace('/(tabs)');
      return;
    }
    try {
      await upsertAddress({ id: addr.id, is_default: true });
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    }
  };

  // Use current location → show apartment number step
  const useCurrentLocation = () => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const pAddr = results[0].formatted_address || '';
              const components = results[0].address_components || [];
              const locality = components.find((c) => c.types.includes('sublocality_level_1'))?.long_name || '';
              setPending({
                landmark: locality,
                address_line: pAddr,
                city: '',
                pin_code: '',
              });
              setAptNumber('');
              setLandmarkText('');
            }
          });
        },
        () => showToast('Location access denied'),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  };

  // ── Apartment number step ──
  if (pending) {
    return (
      <MobileContainer>
        <View style={st.container}>
          <View style={st.searchBar}>
            <Pressable onPress={() => setPending(null)} hitSlop={8} style={st.backBtn}>
              <ChevronLeft size={22} color={colors.foreground} />
            </Pressable>
            <Text style={st.stepTitle}>Update Address</Text>
          </View>

          <View style={st.confirmCard}>
            <View style={st.confirmLocationRow}>
              <MapPin size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={st.confirmLandmark}>
                  {pending.landmark}
                </Text>
                <Text style={st.confirmAddr} numberOfLines={2}>{pending.address_line}</Text>
              </View>
            </View>

            <TextInput
              style={st.aptInput}
              placeholder="Flat / House No."
              placeholderTextColor={colors.mutedForeground}
              value={aptNumber}
              onChangeText={setAptNumber}
              autoFocus
              returnKeyType="next"
            />

            <TextInput
              style={st.aptInput}
              placeholder="Landmark (Optional)"
              placeholderTextColor={colors.mutedForeground}
              value={landmarkText}
              onChangeText={setLandmarkText}
              returnKeyType="done"
              onSubmitEditing={confirmAddress}
            />

            <Pressable
              style={[st.confirmBtn, saving && { opacity: 0.6 }]}
              onPress={confirmAddress}
              disabled={saving}
            >
              <Text style={st.confirmBtnText}>{saving ? 'Saving...' : 'Update'}</Text>
            </Pressable>
          </View>
        </View>
      </MobileContainer>
    );
  }

  // ── Search step ──
  return (
    <MobileContainer>
      <View style={st.container}>
        <View style={st.searchBar}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={st.backBtn}>
            <ChevronLeft size={22} color={colors.foreground} />
          </Pressable>
          <TextInput
            style={st.searchInput}
            placeholder="Search for your location"
            placeholderTextColor={colors.mutedForeground}
            value={searchText}
            onChangeText={onSearchChange}
            autoFocus
            returnKeyType="search"
          />
        </View>

        {predictions.length > 0 && (
          <View style={st.predictionsWrap}>
            {predictions.map((p) => (
              <Pressable
                key={p.place_id}
                style={st.predictionRow}
                onPress={() => pickPrediction(p)}
              >
                <MapPin size={16} color={colors.mutedForeground} />
                <View style={{ flex: 1 }}>
                  <Text style={st.predictionMain} numberOfLines={1}>
                    {p.structured_formatting?.main_text || p.description}
                  </Text>
                  <Text style={st.predictionSub} numberOfLines={1}>
                    {p.structured_formatting?.secondary_text || ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {predictions.length === 0 && (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Pressable style={st.currentLocationRow} onPress={useCurrentLocation}>
              <Navigation size={18} color={colors.primary} />
              <Text style={st.currentLocationText}>Use current location</Text>
            </Pressable>

            <View style={st.divider} />

            {addresses.length > 0 && (
              <View style={st.savedSection}>
                <Text style={st.savedTitle}>Saved</Text>
                {addresses.map((addr) => (
                  <Pressable
                    key={addr.id}
                    style={st.savedRow}
                    onPress={() => selectSaved(addr)}
                  >
                    <Home size={20} color={colors.mutedForeground} />
                    <View style={{ flex: 1 }}>
                      <Text style={st.savedLabel} numberOfLines={1}>
                        Home{addr.address_line ? ` - ${addr.address_line}` : ''}
                      </Text>
                      {addr.city ? (
                        <Text style={st.savedAddress} numberOfLines={2}>{addr.city}</Text>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </MobileContainer>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchSurface,
    borderRadius: radii.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
  },
  backBtn: {
    padding: spacing.sm,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.foreground,
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    outlineStyle: 'none',
  } as any,
  predictionsWrap: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
  },
  predictionMain: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  predictionSub: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
  },
  currentLocationText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.dividerLight,
    marginHorizontal: spacing.xl,
  },
  savedSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
  },
  savedLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  savedAddress: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: 3,
    lineHeight: 19,
  },

  // Confirm step
  confirmCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  confirmLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  confirmLandmark: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  confirmAddr: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 19,
  },
  aptInput: {
    ...typography.body,
    color: colors.foreground,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.searchSurface,
    outlineStyle: 'none',
  } as any,
  confirmBtn: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginTop: spacing.md,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primaryForeground,
  },
});
