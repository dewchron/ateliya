import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, Animated, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ChevronLeft, Navigation, Calendar, Clock } from 'lucide-react-native';
import { MobileContainer } from '../../src/components/MobileContainer';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/contexts/ToastContext';
import { updateProfile } from '../../src/services/profile.service';
import { getAddresses, upsertAddress } from '../../src/services/address.service';
import { getCommunities } from '../../src/services/community.service';
import { colors, spacing, radii, typography } from '../../src/constants/theme';
import type { CommunityRow } from '../../src/types/database.types';

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
const DEFAULT_CENTER = { lat: 17.4637, lng: 78.3522 };

/* ── Load Google Maps JS API ─── */
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

export default function DetailsScreen() {
  const router = useRouter();
  const { refreshProfile, unverifiedResult, profile } = useAuth();
  const { showToast } = useToast();

  // Unverified customers: skip map if address exists, pre-fill name
  const isUnverified = unverifiedResult?.unverified === true;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(unverifiedResult?.name || '');
  const [saving, setSaving] = useState(false);

  // Map state
  const [coords, setCoords] = useState(DEFAULT_CENTER);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Search state
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // Selected place
  const [placeName, setPlaceName] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');

  // Community match
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [matchedCommunity, setMatchedCommunity] = useState<CommunityRow | null>(null);

  // Address form (step 3)
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');

  // Google refs
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimer = useRef<any>(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [step]);

  // Load communities
  useEffect(() => {
    getCommunities().then(setCommunities).catch(() => {});
  }, []);

  // Pre-fill address for unverified customers
  useEffect(() => {
    if (isUnverified && unverifiedResult?.had_address) {
      getAddresses().then((addrs) => {
        const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
        if (defaultAddr) {
          const addrLine = defaultAddr.address_line || '';
          const lm = defaultAddr.landmark || '';
          // Extract flat number: address_line is "41, Vessella Villas", landmark is "Vessella Villas"
          let flat = '';
          if (lm && addrLine.includes(lm)) {
            flat = addrLine.replace(lm, '').replace(/^[\s,]+|[\s,]+$/g, '');
          }
          setPlaceName(lm || addrLine);
          setPlaceAddress(defaultAddr.city || '');
          setFlatNo(flat);
          setLandmark(lm);
        }
      }).catch(() => {});
    }
  }, [isUnverified]);

  const formatDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  /* ── Autocomplete search ─── */
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

  /* ── Pick a prediction ─── */
  const pickPrediction = useCallback((prediction: any) => {
    if (!placesRef.current) return;
    placesRef.current.getDetails(
      { placeId: prediction.place_id, fields: ['geometry', 'name', 'formatted_address'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const pName = place.name || '';
        const pAddr = place.formatted_address || '';

        setCoords({ lat, lng });
        setPlaceName(pName);
        setPlaceAddress(pAddr);
        setSearchFocused(false);
        setSearchText('');
        setPredictions([]);

        // Exact match against communities DB
        const match = communities.find(
          (c) => c.name.toLowerCase() === pName.toLowerCase(),
        );
        setMatchedCommunity(match || null);

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(17);
        }
        if (markerRef.current) {
          markerRef.current.position = { lat, lng };
        }
      },
    );
  }, [communities]);

  /* ── Init Google Map ─── */
  useEffect(() => {
    if (step !== 2 || Platform.OS !== 'web') return;
    let alive = true;

    (async () => {
      let goog: typeof google;
      try { goog = await loadGoogleMaps(); } catch { showToast('Failed to load map'); return; }
      if (!alive) return;

      await new Promise((r) => setTimeout(r, 80));
      const el = document.getElementById('onboarding-map');
      if (!el || mapRef.current) return;

      const map = new goog.maps.Map(el, {
        center: { lat: coords.lat, lng: coords.lng },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      const marker = new goog.maps.Marker({
        position: { lat: coords.lat, lng: coords.lng },
        map,
        draggable: true,
        icon: {
          path: 'M12 2C7.03 2 3 6.03 3 11c0 7.5 9 13 9 13s9-5.5 9-13c0-4.97-4.03-9-9-9zm0 12.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 7.5 12 7.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z',
          fillColor: colors.primary,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 1.8,
          anchor: new goog.maps.Point(12, 24),
        },
      });

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (pos) setCoords({ lat: pos.lat(), lng: pos.lng() });
      });

      // Places services
      autocompleteRef.current = new goog.maps.places.AutocompleteService();
      placesRef.current = new goog.maps.places.PlacesService(map);

      mapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);

      // Geolocate
      if (navigator.geolocation) {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const la = pos.coords.latitude, lo = pos.coords.longitude;
            map.panTo({ lat: la, lng: lo });
            map.setZoom(15);
            marker.setPosition({ lat: la, lng: lo });
            setCoords({ lat: la, lng: lo });
            setLocating(false);
          },
          () => setLocating(false),
          { enableHighAccuracy: true, timeout: 8000 },
        );
      }
    })();

    return () => {
      alive = false;
      mapRef.current = null;
      markerRef.current = null;
      autocompleteRef.current = null;
      placesRef.current = null;
      setMapReady(false);
    };
  }, [step]);

  const goToMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude, lo = pos.coords.longitude;
        if (mapRef.current) { mapRef.current.panTo({ lat: la, lng: lo }); mapRef.current.setZoom(16); }
        if (markerRef.current) (markerRef.current as google.maps.Marker).setPosition({ lat: la, lng: lo });
        setCoords({ lat: la, lng: lo });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  /* ── Save ─── */
  const handleSave = async () => {
    setSaving(true);
    try {
      // Always update name if provided
      if (name.trim()) {
        await updateProfile({ full_name: name.trim() });
      }

      if (isUnverified && unverifiedResult?.had_address) {
        // For unverified users, address was already transferred.
        // Update it if the user made edits.
        const addrs = await getAddresses();
        const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
        if (defaultAddr) {
          const updatedLine = flatNo.trim()
            ? `${flatNo.trim()}, ${placeName}`
            : placeName;
          await upsertAddress({
            id: defaultAddr.id,
            address_line: updatedLine || defaultAddr.address_line || undefined,
            city: placeAddress || defaultAddr.city || undefined,
            landmark: landmark.trim() || defaultAddr.landmark || undefined,
            is_default: true,
          });
        }
      } else {
        // Normal flow — create new address from map selection
        const addressLine = flatNo.trim()
          ? `${flatNo.trim()}, ${placeName}`
          : placeName;
        await upsertAddress({
          address_line: addressLine || undefined,
          city: placeAddress || undefined,
          pin_code: matchedCommunity?.pincode || undefined,
          landmark: landmark.trim() || undefined,
          is_default: true,
        });
      }

      await refreshProfile();
      router.replace('/(tabs)');
    } catch (err: any) {
      showToast(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  /* ══════ STEP 1 — Name ══════ */
  if (step === 1) {
    const canGo = name.trim().length > 0;
    return (
      <MobileContainer>
        <KeyboardAvoidingView style={st.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={st.decorShape} />
          <Animated.View style={[st.nameBody, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={st.heading}>Welcome!</Text>
            <View style={{ height: spacing.xl }} />
            <TextInput
              style={st.input}
              placeholder="Your Name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => { if (canGo) setStep(isUnverified && unverifiedResult?.had_address ? 3 : 2); }}
            />
            <Pressable
              style={({ pressed }) => [st.pillBtn, !canGo && st.disabled, pressed && canGo && st.pressed]}
              onPress={() => { if (canGo) setStep(isUnverified && unverifiedResult?.had_address ? 3 : 2); }}
              disabled={!canGo}
            >
              <Text style={st.pillText}>Continue</Text>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </MobileContainer>
    );
  }

  /* ══════ STEP 2 — Google Map + Places Search ══════ */
  if (step === 2) {
    return (
      <MobileContainer>
        <View style={st.mapScreen}>
          {/* Search bar */}
          <View style={st.searchBar}>
            <Pressable
              onPress={() => {
                if (searchFocused) { setSearchFocused(false); setPredictions([]); }
                else setStep(1);
              }}
              style={st.searchBack}
            >
              <ChevronLeft size={22} color={colors.foreground} />
            </Pressable>
            <TextInput
              style={st.searchInput}
              placeholder="Set Pickup Location"
              placeholderTextColor={colors.mutedForeground}
              value={searchText}
              onChangeText={onSearchChange}
              onFocus={() => setSearchFocused(true)}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => { setSearchText(''); setPredictions([]); }} style={{ padding: 4 }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Autocomplete results */}
          {searchFocused && predictions.length > 0 && (
            <View style={st.resultsList}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {predictions.map((p) => (
                  <Pressable key={p.place_id} style={st.resultItem} onPress={() => pickPrediction(p)}>
                    <MapPin size={16} color={colors.primary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={st.resultMain} numberOfLines={1}>
                        {p.structured_formatting?.main_text || p.description}
                      </Text>
                      <Text style={st.resultSec} numberOfLines={1}>
                        {p.structured_formatting?.secondary_text || ''}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Map */}
          <View style={st.mapWrap}>
            <View nativeID="onboarding-map" style={st.mapInner} />
            {!mapReady && (
              <View style={st.mapLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            <Pressable style={st.locateBtn} onPress={goToMyLocation}>
              {locating
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Navigation size={17} color={colors.primary} />}
            </Pressable>
          </View>

          {/* Bottom card */}
          <View style={st.bottomCard}>
            {placeName ? (
              <>
                <Text style={st.hintText}>Place the pin at exact location</Text>
                <View style={st.placeRow}>
                  <MapPin size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.placeName}>{placeName}</Text>
                    <Text style={st.placeAddr} numberOfLines={2}>{placeAddress}</Text>
                  </View>
                </View>
                {matchedCommunity && (matchedCommunity.planned_date || matchedCommunity.time_range) && (
                  <View style={st.scheduleBanner}>
                    {matchedCommunity.planned_date && (
                      <View style={st.scheduleChip}>
                        <Calendar size={13} color={colors.primary} />
                        <Text style={st.scheduleText}>{formatDate(matchedCommunity.planned_date)}</Text>
                      </View>
                    )}
                    {matchedCommunity.time_range && (
                      <View style={st.scheduleChip}>
                        <Clock size={13} color={colors.primary} />
                        <Text style={st.scheduleText}>{matchedCommunity.time_range}</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            ) : (
              <Text style={st.hintText}>
                {locating ? 'Detecting your location...' : 'Search for your apartment or area'}
              </Text>
            )}
            <Pressable
              style={({ pressed }) => [st.confirmBtn, !placeName && st.disabled, pressed && placeName && st.pressed]}
              onPress={() => { if (placeName) setStep(3); }}
              disabled={!placeName}
            >
              <Text style={st.confirmText}>Next</Text>
            </Pressable>
          </View>
        </View>
      </MobileContainer>
    );
  }

  /* ══════ STEP 3 — Confirm address ══════ */
  return (
    <MobileContainer>
      <View style={st.container}>
        <View style={st.confirmHeader}>
          <Pressable onPress={() => setStep(isUnverified && unverifiedResult?.had_address ? 1 : 2)} hitSlop={8} style={{ padding: spacing.sm }}>
            <ChevronLeft size={22} color={colors.foreground} />
          </Pressable>
          <Text style={st.confirmTitle}>Confirm your address</Text>
        </View>

        <View style={st.confirmCard}>
          <View style={st.placeRow}>
            <MapPin size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={st.placeName}>{placeName}</Text>
              <Text style={st.placeAddr} numberOfLines={2}>{placeAddress}</Text>
            </View>
          </View>

          <TextInput
            style={st.confirmInput}
            placeholder="Flat / House No."
            placeholderTextColor={colors.mutedForeground}
            value={flatNo}
            onChangeText={setFlatNo}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <TextInput
            style={st.confirmInput}
            placeholder="Landmark (Optional)"
            placeholderTextColor={colors.mutedForeground}
            value={landmark}
            onChangeText={setLandmark}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <Pressable
            style={({ pressed }) => [st.saveBtn, saving && st.disabled, pressed && !saving && st.pressed]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={st.saveText}>{saving ? 'Saving...' : 'Confirm'}</Text>
          </Pressable>
        </View>
      </View>
    </MobileContainer>
  );
}

/* ══════ Styles ══════ */
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },

  /* Step 1 */
  decorShape: {
    position: 'absolute', top: 30, right: -20, width: 180, height: 160,
    borderRadius: 36, backgroundColor: colors.surfaceMuted,
    transform: [{ rotate: '-8deg' }], opacity: 0.45,
  },
  nameBody: { flex: 1, paddingTop: 80, paddingHorizontal: spacing.xxl, gap: spacing.lg },
  heading: { fontSize: 18, fontWeight: '300', color: colors.foreground, lineHeight: 26 },
  sub: { ...typography.bodySmall, color: colors.mutedForeground, marginBottom: spacing.lg },
  field: { gap: spacing.xs },
  label: { ...typography.label, color: colors.foreground },
  input: {
    backgroundColor: colors.searchSurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...typography.body,
    color: colors.foreground,
    outlineStyle: 'none',
  } as any,
  pillBtn: {
    backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 28,
    borderRadius: radii.full, alignItems: 'center', alignSelf: 'center', marginTop: spacing.xl,
  },
  pillText: { color: '#fff', fontSize: 14, fontWeight: '500' },

  /* Step 2 — Map */
  mapScreen: { flex: 1, backgroundColor: colors.background },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginHorizontal: 12, marginTop: 10, marginBottom: 6,
    backgroundColor: '#fff', borderRadius: radii.xl,
    paddingVertical: 4, paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
    borderWidth: 1, borderColor: colors.border,
    zIndex: 20,
  },
  searchBack: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: 15, color: colors.foreground, paddingVertical: 8, outlineStyle: 'none' } as any,

  resultsList: {
    position: 'absolute', top: 60, left: 12, right: 12, zIndex: 30,
    backgroundColor: '#fff', borderRadius: radii.lg, maxHeight: 300,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  resultItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  resultMain: { fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 1 },
  resultSec: { fontSize: 13, color: colors.mutedForeground },

  mapWrap: { flex: 1, position: 'relative', overflow: 'hidden' },
  mapInner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
  },
  locateBtn: {
    position: 'absolute', bottom: 16, right: 16, zIndex: 5,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    borderWidth: 1, borderColor: colors.border,
  },

  bottomCard: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 4,
  },
  hintText: { fontSize: 13, color: colors.mutedForeground, marginBottom: 10 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  placeName: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 2 },
  placeAddr: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
  scheduleBanner: {
    flexDirection: 'row', gap: 14, marginTop: 4, marginBottom: 4,
    paddingVertical: 8, paddingHorizontal: 10,
    backgroundColor: colors.selectedBg || '#f0f5ee',
    borderRadius: radii.md,
  },
  scheduleChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  scheduleText: { fontSize: 13, fontWeight: '600', color: colors.primary },

  confirmBtn: {
    backgroundColor: colors.primary, borderRadius: radii.full,
    paddingVertical: 10, paddingHorizontal: 28,
    alignItems: 'center', alignSelf: 'center', marginTop: 12,
  },
  confirmText: { fontSize: 14, fontWeight: '500', color: colors.primaryForeground },

  /* Step 3 — Confirm */
  confirmHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.searchSurface || colors.muted,
    borderRadius: radii.xl,
    marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md,
    paddingRight: spacing.md,
  },
  confirmTitle: {
    fontSize: 16, fontWeight: '600', color: colors.foreground,
    paddingVertical: 14, paddingHorizontal: spacing.sm,
  },
  confirmCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    paddingHorizontal: spacing.xl, gap: spacing.lg,
  },
  confirmInput: {
    ...typography.body,
    color: colors.foreground,
    borderRadius: radii.xl,
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    backgroundColor: colors.searchSurface || colors.muted,
    outlineStyle: 'none',
  } as any,

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radii.full,
    paddingVertical: 10, paddingHorizontal: 28,
    alignSelf: 'center', alignItems: 'center', marginTop: spacing.md,
  },
  saveText: { fontSize: 14, fontWeight: '500', color: colors.primaryForeground },
});
