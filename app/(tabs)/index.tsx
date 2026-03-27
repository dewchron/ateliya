import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radii } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Carousel } from '../../src/components/Carousel';
import { TabPage } from '../../src/components/PageLayout';
import { edits } from '../../src/constants/data';
import { getAddresses } from '../../src/services/address.service';
import { getCommunities } from '../../src/services/community.service';
import { getServicePrices, type ServicePrice } from '../../src/services/pricing.service';
import { useAuth } from '../../src/contexts/AuthContext';
import { useBooking } from '../../src/contexts/BookingContext';
import { MapPin, ChevronDown } from 'lucide-react-native';
import type { CommunityRow } from '../../src/types/database.types';

const SERVICE_ICONS: Record<string, any> = {
  'saree fall & pico': require('../../assets/images/svc-saree-fall.png'),
  'alterations': require('../../assets/images/svc-alterations.png'),
  'flexfit blouse': require('../../assets/images/svc-flexfit-blouse.png'),
  'repurposing': require('../../assets/images/svc-repurposing-new.png'),
};

const SERVICE_DESCS: Record<string, string> = {
  'saree fall & pico': 'Convenient Pick and Drop Off',
  'alterations': 'Sizing, Correct Fit, Repairs',
  'flexfit blouse': 'Convert your regular blouse to FlexFit Blouses with Stretch Panels',
  'repurposing': 'Convert your unused sarees to stylish outfits',
};

function FlipCard({ icon, name, desc, cropIcon }: { icon: any; name: string; desc: string; cropIcon?: boolean }) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  return (
    <Pressable onPress={handleFlip} style={styles.flipCardWrap}>
      <Animated.View style={[styles.serviceCell, styles.flipFace, { transform: [{ rotateY: frontInterpolate }] }]}>
        {cropIcon ? (
          <View style={styles.croppedIconWrap}>
            <Image source={icon} style={styles.croppedIcon} resizeMode="cover" />
          </View>
        ) : (
          <Image source={icon} style={styles.serviceIcon} resizeMode="contain" />
        )}
        <Text style={styles.serviceName}>{name}</Text>
      </Animated.View>
      <Animated.View style={[styles.serviceCell, styles.flipFace, styles.flipBack, { transform: [{ rotateY: backInterpolate }] }]}>
        <Text style={styles.serviceDesc}>{desc}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { dispatch } = useBooking();
  const [defaultAddress, setDefaultAddress] = useState<{ address_line: string | null; landmark: string | null } | null>(null);
  const [matchedCommunity, setMatchedCommunity] = useState<CommunityRow | null>(null);
  const [servicesList, setServicesList] = useState<ServicePrice[]>([]);

  // Load default address + match community + services
  const loadAddress = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const [addrs, communities] = await Promise.all([getAddresses(), getCommunities()]);
      const def = addrs.find((a) => a.is_default) || addrs[0];
      if (!def) return;
      setDefaultAddress({ address_line: def.address_line, landmark: def.landmark });
      const addrLower = (def.address_line || '').toLowerCase();
      const match = communities.find(
        (c) => {
          const cName = c.name.toLowerCase();
          return (def.landmark && cName === def.landmark.toLowerCase()) || addrLower.includes(cName);
        },
      );
      setMatchedCommunity(match || null);
    } catch {}
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      try {
        const prices = await getServicePrices();
        setServicesList(prices);
      } catch {}
    })();
    loadAddress();
  }, [session?.user?.id]);

  // Re-fetch address when screen comes back into focus
  useFocusEffect(useCallback(() => { loadAddress(); }, [loadAddress]));

  const formatPickupDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' });
  };

  const almiraSlides: React.ReactNode[] = [
    <Pressable key="intro" onPress={() => router.push('/(tabs)/almira')}>
      <View style={styles.almiraIntroSlide}>
        <View style={styles.almiraIntroTop}>
          <Text style={styles.almiraIntroLabel}>February Edits</Text>
          <Text style={styles.almiraIntroTitle}>Summer Workwear</Text>
          <Text style={styles.almiraIntroDesc}>Light, breezy looks for the office</Text>
        </View>
        <View style={styles.almiraIntroPreviews}>
          {edits.map((edit) => (
            <Image
              key={edit.id}
              source={edit.image}
              style={styles.almiraPreviewImg}
              resizeMode="cover"
            />
          ))}
        </View>
      </View>
    </Pressable>,
    ...edits.map((edit) => (
      <Pressable key={edit.id} onPress={() => router.push(`/(tabs)/almira/edit/${edit.id}`)}>
        <Image source={edit.image} style={styles.editSlideImage} resizeMode="contain" />
        <Text style={styles.editSlideTitle}>{edit.subtitle}</Text>
        <Text style={styles.editSlideDesc}>{edit.desc}</Text>
      </Pressable>
    )),
  ];

  return (
    <TabPage noHeader>
      {/* Sage green section — address only */}
      <View style={styles.greenCard}>
        {/* Pickup schedule */}
        {matchedCommunity && (matchedCommunity.planned_date || matchedCommunity.time_range) && (
          <Text style={styles.pickupScheduleText}>
            Pickup{matchedCommunity.time_range ? ` — ${matchedCommunity.time_range}` : ''}
            {matchedCommunity.planned_date ? `, ${formatPickupDate(matchedCommunity.planned_date)}` : ''}
          </Text>
        )}

        {/* Address row */}
        <Pressable
          style={styles.addressRow}
          onPress={() => router.push('/(tabs)/profile/address-picker' as any)}
        >
          <MapPin size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.addressText} numberOfLines={1}>
            {defaultAddress
              ? `Home - ${defaultAddress.address_line || ''}`
              : 'Set your address'}
          </Text>
          <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
        </Pressable>

        {/* Tagline */}
        <Text style={styles.tagline}>Quality Fashion Services{'\n'}at Your Doorstep</Text>

        {/* How it works flow */}
        <Text style={styles.flowText}>
          You Schedule  →  We Pick Up  →  We Service  →  We Deliver
        </Text>

        {/* Illustration images */}
        <View style={styles.flowImages}>
          <Image source={require('../../assets/images/how-schedule.jpeg')} style={styles.flowImg} resizeMode="cover" />
          <Image source={require('../../assets/images/how-pickup.jpeg')} style={styles.flowImg} resizeMode="cover" />
          <Image source={require('../../assets/images/how-service.jpeg')} style={styles.flowImg} resizeMode="cover" />
          <Image source={require('../../assets/images/how-deliver.jpeg')} style={styles.flowImg} resizeMode="cover" />
        </View>
      </View>

      {/* Our Services — below the green card */}
      <View style={styles.servicesHeader}>
        <Text style={[styles.sectionHeading, styles.sectionHeadingDark, { marginBottom: 0 }]}>Our Services</Text>
        <Pressable style={styles.scheduleCta} onPress={() => {
          if (matchedCommunity) {
            dispatch({
              type: 'SELECT_COMMUNITY',
              communityId: matchedCommunity.id,
              communityName: matchedCommunity.name,
              date: matchedCommunity.planned_date || '',
              time: matchedCommunity.time_range || '',
            });
          }
          router.push('/(tabs)/services');
        }}>
          <Text style={styles.scheduleCtaText}>Schedule</Text>
        </Pressable>
      </View>
      <View style={styles.servicesGrid}>
        <View style={styles.servicesRow}>
          <FlipCard icon={require('../../assets/images/svc-alterations.png')} name="Alterations" desc={SERVICE_DESCS['alterations']} />
          <FlipCard icon={require('../../assets/images/svc-saree-fall-new.png')} name="Saree Fall & Pico" desc={SERVICE_DESCS['saree fall & pico']} cropIcon />
        </View>
        <View style={styles.servicesRow}>
          <FlipCard icon={require('../../assets/images/svc-flexfit-blouse.png')} name="FlexFit Blouse" desc={SERVICE_DESCS['flexfit blouse']} />
          <FlipCard icon={require('../../assets/images/svc-repurposing-new.png')} name="Repurposing" desc={SERVICE_DESCS['repurposing']} cropIcon />
        </View>
      </View>


      {/* Almira — hidden for now, will reintroduce later
      <Card noPadding style={{ marginTop: spacing.lg }}>
        <View style={styles.almiraHeader}>
          <Text style={styles.almiraSectionTitle}>Almira</Text>
          <Text style={styles.almiraSubtitle}>Style Inspiration & Digital Wardrobe</Text>
        </View>
        <Carousel>{almiraSlides}</Carousel>
      </Card>
      */}

    </TabPage>
  );
}

const styles = StyleSheet.create({
  /* Green section */
  greenCard: {
    backgroundColor: colors.foreground,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    marginTop: -spacing.lg,
    marginHorizontal: -spacing.xl,
    marginBottom: spacing.xl,
  },

  /* Pickup schedule */
  pickupScheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },

  /* Address row */
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },

  /* Section headings */
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  sectionHeadingDark: {
    color: colors.foreground,
  },

  /* Services */
  servicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  servicesGrid: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  servicesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flipCardWrap: {
    flex: 1,
    perspective: 1000,
  },
  flipFace: {
    backfaceVisibility: 'hidden',
  },
  flipBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  serviceCell: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  serviceDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 4,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  croppedIconWrap: {
    width: 44,
    height: 36,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  croppedIcon: {
    width: 44,
    height: 56,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 16,
  },
  scheduleCta: {
    backgroundColor: '#2d4a22',
    borderRadius: radii.full,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  /* Tagline + flow */
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: spacing.xxl,
    lineHeight: 30,
  },
  flowText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.md,
    letterSpacing: 0.3,
  },
  flowImages: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  flowImg: {
    flex: 1,
    height: 200,
    borderRadius: radii.md,
  },

  /* Almira */
  almiraHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  almiraSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: -0.3,
  },
  /* Note: Almira card is white via Card component */
  almiraSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  almiraIntroSlide: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  almiraIntroTop: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  almiraIntroLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  almiraIntroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: 10,
  },
  almiraIntroDesc: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  almiraIntroPreviews: {
    flexDirection: 'row',
    gap: 6,
    padding: 10,
    backgroundColor: colors.card,
  },
  almiraPreviewImg: {
    flex: 1,
    height: 80,
    borderRadius: 6,
  },
  editSlideImage: {
    height: 280,
    width: '100%',
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  editSlideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginTop: 12,
    marginBottom: 4,
  },
  editSlideDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
  },

});
