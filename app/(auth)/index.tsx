import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Linking,
  TextInput,
  ViewStyle,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Shirt,
  Scissors,
  RefreshCw,
  ShoppingBag,
  Lightbulb,
  Heart,
  Mail,
  MessageCircle,
  Youtube,
  Instagram,
  Linkedin,
  Menu,
  X,
  Twitter,
  Send,
  Check,
} from 'lucide-react-native';
import { colors, spacing, radii, typography } from '../../src/constants/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { trackClick, trackPageView } from '../../src/services/analytics.service';
import { submitContactForm } from '../../src/services/contact.service';

const DARK_SAGE = '#5a6b52';

const SERVICE_ICONS: Record<string, any> = {
  'saree fall & pico': require('../../assets/images/svc-saree-fall-new.png'),
  'alterations': require('../../assets/images/svc-alterations.png'),
  'flexfit blouse': require('../../assets/images/svc-flexfit-blouse.png'),
  'repurposing': require('../../assets/images/svc-repurposing-new.png'),
};
const MAX_CONTENT = 1100;
const HEADER_HEIGHT = 56;

const NAV_ITEMS = ['Home', 'What We Do', 'Our Story', 'The Team', 'Say Hello'] as const;
const SECTION_KEYS = ['hero', 'services', 'story', 'team', 'contact'] as const;

/** Full-width bg section → centered inner content on wide screens */
function Section({
  children,
  style,
  isWide,
  innerStyle,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  isWide: boolean;
  innerStyle?: ViewStyle;
}) {
  if (!isWide) return <View style={style}>{children}</View>;
  return (
    <View style={[style, { alignItems: 'center' }]}>
      <View
        style={[
          { width: '100%', maxWidth: MAX_CONTENT, paddingHorizontal: 48 },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function LandingScreen() {
  const router = useRouter();
  const go = () => router.push('/(auth)/phone');
  const { isWide } = useResponsive();

  useEffect(() => { trackPageView('landing'); }, []);

  /** Fire analytics then run the original callback */
  const track = (elementId: string, label: string, section: string, cb?: () => void) => () => {
    trackClick(elementId, label, section);
    cb?.();
  };

  const scrollRef = useRef<ScrollView>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSending, setFormSending] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const sectionY = useRef<Record<string, number>>({});

  const trackSection = useCallback(
    (key: string) => (e: { nativeEvent: { layout: { y: number } } }) => {
      sectionY.current[key] = e.nativeEvent.layout.y;
    },
    [],
  );

  const scrollTo = useCallback((key: string) => {
    const y = sectionY.current[key] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
    setMenuOpen(false);
  }, []);

  const handleContactSubmit = async () => {
    if (!formEmail.trim() || !formMessage.trim()) return;
    setFormSending(true);
    const ok = await submitContactForm(formEmail.trim(), formMessage.trim(), formPhone.trim() || undefined);
    setFormSending(false);
    if (ok) {
      setFormSent(true);
      setTimeout(() => {
        setContactOpen(false);
        setFormSent(false);
        setFormEmail('');
        setFormPhone('');
        setFormMessage('');
      }, 1800);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          {isWide ? (
            <>
              <Image
                source={require('../../assets/images/logo-light.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <View style={styles.navRow}>
                {NAV_ITEMS.map((item, i) => (
                  <Pressable
                    key={item}
                    onPress={track(`nav-${SECTION_KEYS[i]}`, item, 'nav', () => scrollTo(SECTION_KEYS[i]))}
                    style={({ pressed }) => pressed && { opacity: 0.6 }}
                  >
                    <Text style={styles.navLink}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <Image
                source={require('../../assets/images/logo-light.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Pressable onPress={track('menu-open', 'Menu', 'nav', () => setMenuOpen(true))} hitSlop={8} style={{ zIndex: 1 }}>
                <Menu size={22} color={colors.foreground} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HERO ─── */}
        <View onLayout={trackSection('hero')}>
          <Section style={styles.hero} isWide={isWide} innerStyle={{ paddingTop: 48, paddingBottom: 24 }}>
            <View style={styles.heroDecor} />

            <>
              <Text style={styles.heroTagline}>Quality Fashion Services{'\n'}at Your Doorstep</Text>
              <Text style={styles.heroFlowText}>
                You Schedule  →  We Pick Up  →  We Service  →  We Deliver
              </Text>
              <View style={[styles.heroImagesRow, isWide && styles.heroImagesRowWide]}>
                <Image source={require('../../assets/images/how-schedule.jpeg')} style={[styles.heroImgQuad, isWide && styles.heroImgGridItem]} resizeMode="cover" />
                <Image source={require('../../assets/images/how-pickup.jpeg')} style={[styles.heroImgQuad, isWide && styles.heroImgGridItem]} resizeMode="cover" />
                <Image source={require('../../assets/images/how-service.jpeg')} style={[styles.heroImgQuad, isWide && styles.heroImgGridItem]} resizeMode="cover" />
                <Image source={require('../../assets/images/how-deliver.jpeg')} style={[styles.heroImgQuad, isWide && styles.heroImgGridItem]} resizeMode="cover" />
              </View>
              <Pressable
                style={({ pressed }) => [styles.pillBtn, { alignSelf: 'center', marginTop: spacing.lg }, pressed && styles.pressed]}
                onPress={track('hero-cta', 'GET STARTED', 'hero', () => Linking.openURL('https://wa.me/917702603311?text=Hi%2C%20I%20would%20like%20to%20Schedule%20a%20Pick%20Up'))}
              >
                <Text style={styles.pillBtnText}>GET STARTED</Text>
              </Pressable>

              <Text style={styles.signIn}>
                Already have an account?{' '}
                <Text style={styles.signInLink} onPress={track('sign-in-link-hero', 'Sign In', 'hero', go)}>
                  Sign In
                </Text>
              </Text>
            </>
          </Section>
        </View>

        {/* ─── Curved transition ─── */}
        <View style={styles.curveTransition} />

        {/* ─── SERVICES ─── */}
        <View onLayout={trackSection('services')}>
          <Section style={styles.services} isWide={isWide} innerStyle={{ alignItems: 'center' }}>
            <>
              {/* Services */}
              <View style={styles.serviceGroup}>
                <View style={styles.subHeaderRow}>
                  <View style={styles.subHeaderLine} />
                  <Text style={styles.subHeader}>Services</Text>
                  <View style={styles.subHeaderLine} />
                </View>
                <Text style={styles.subHeaderDesc}>
                  Bringing our expert services to your doorstep
                </Text>
                <View style={[isWide ? styles.cardGrid3 : styles.cardGrid2x2, isWide && { gap: spacing.md }]}>
                  {DOORSTEP_SERVICES.map((s) => (
                    <View key={s.title} style={[styles.serviceCard, !isWide && styles.serviceCard2x2, isWide && styles.serviceCardWide]}>
                      <View style={[styles.cardIconBadge, isWide && styles.cardIconBadgeWide, { marginBottom: spacing.md }]}>
                        <Image
                          source={SERVICE_ICONS[s.title.toLowerCase()]}
                          style={[styles.serviceIconImg, isWide && styles.serviceIconImgWide]}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={[styles.cardTitle, isWide && styles.cardTitleWide]}>{s.title}</Text>
                      <Text style={[styles.cardDesc, isWide && styles.cardDescWide]}>{s.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Almira */}
              <View style={styles.serviceGroup}>
                <View style={styles.subHeaderRow}>
                  <View style={styles.subHeaderLine} />
                  <Text style={styles.subHeader}>Almira</Text>
                  <View style={styles.subHeaderLine} />
                </View>
                <Text style={styles.subHeaderDesc}>
                  Inspiration and intelligence for your wardrobe
                </Text>

                <View style={[styles.cardGrid2, isWide && { gap: spacing.lg }]}>
                  {ALMIRA_SERVICES.map((s) => (
                    <View key={s.title} style={[styles.serviceCard, isWide && styles.serviceCardWide]}>
                      <View style={styles.cardIconWrap}>
                        <View style={[styles.cardIconBadge, isWide && styles.cardIconBadgeWide]}>
                          <s.icon size={isWide ? 26 : 18} color={DARK_SAGE} />
                        </View>
                        {s.badge ? (
                          <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText} numberOfLines={1}>{s.badge}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.cardTitle, isWide && styles.cardTitleWide]}>{s.title}</Text>
                      <Text style={[styles.cardDesc, isWide && styles.cardDescWide]}>{s.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>

            <Pressable
              style={({ pressed }) => [styles.pillBtn, pressed && styles.pressed]}
              onPress={track('services-cta', 'BOOK A SERVICE', 'services', () => Linking.openURL('https://wa.me/917702603311?text=Hi%2C%20I%20would%20like%20to%20Schedule%20a%20Pick%20Up'))}
            >
              <Text style={styles.pillBtnText}>BOOK A SERVICE</Text>
            </Pressable>
          </Section>
        </View>

        {/* ─── OUR STORY ─── */}
        <View onLayout={trackSection('story')}>
          <Section style={styles.story} isWide={isWide} innerStyle={{ alignItems: 'center' }}>
            <View style={styles.subHeaderRow}>
              <View style={styles.subHeaderLine} />
              <Text style={styles.subHeader}>Our Story</Text>
              <View style={styles.subHeaderLine} />
            </View>
            <Text style={styles.subHeaderDesc}>
              Two Founders, One Vision
            </Text>
            <Text style={styles.storyText}>
              Ateliya began over coffee at a café in Hyderabad. We had met
              earlier through a mutual friend and were simply catching up — no
              agenda. What started as a casual conversation quickly turned into
              long discussions about building something together. As we kept
              talking, it became clear that we approached problems differently,
              but in ways that fit — one drawn to product and structure, the
              other to operations and execution.
            </Text>
            <Text style={styles.storyText}>
              We explored ideas across industries — food, healthcare,
              education — but kept returning to a problem we both experienced
              in our everyday lives. Our closets are full, but they rarely work
              as a whole; they are overfilled and underused.
            </Text>
            <Text style={styles.storyText}>
              Over months of brainstorming, late-night calls, surveys, and
              interviews, we realized our closets don't need more clothes — they
              need clarity, curation, repair, styling, and a simple way to bring
              everything together.
            </Text>
            <Text style={styles.storyText}>
              That gap became Ateliya.
            </Text>

            {/* Quote callout */}
            <View style={styles.quoteBlock}>
              <View style={styles.quoteLine} />
              <View style={styles.quoteContent}>
                <Text style={styles.quoteText}>
                  The future of fashion is not buying more.
                </Text>
                <Text style={styles.quoteText}>
                  It's using what you own <Text style={styles.italic}>better.</Text>
                </Text>
              </View>
            </View>
          </Section>
        </View>

        {/* ─── TEAM ─── */}
        <View onLayout={trackSection('team')}>
          <Section style={styles.team} isWide={isWide} innerStyle={{ alignItems: 'center' }}>
            <View style={[styles.teamCard, isWide && styles.teamCardWide]}>
              <View style={[styles.subHeaderRow, { marginBottom: spacing.xxl }]}>
                <View style={[styles.subHeaderLine, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                <Text style={[styles.subHeader, { color: '#fff' }]}>The Team</Text>
                <View style={[styles.subHeaderLine, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              </View>

              <View style={isWide ? styles.foundersRow : undefined}>
                {/* Hima */}
                <View style={[styles.founderEntry, isWide && { flex: 1 }]}>
                  <View style={styles.founderIcon}>
                    <Lightbulb size={18} color={DARK_SAGE} />
                  </View>
                  <Text style={styles.founderName}>Hima Erukulla</Text>
                  <Text style={styles.founderRole}>Strategy & Product</Text>
                  <Text style={styles.founderBio}>
                    MBA, UC Berkeley ● 12 years Tech Experience{'\n'}Shapes the long-term vision. Passionate about working at
                    the intersection of systems, technology, and everyday life
                  </Text>
                  <Pressable
                    onPress={() => Linking.openURL('https://www.linkedin.com/in/hima-erukulla/')}
                    style={styles.founderLinkedin}
                  >
                    <Linkedin size={16} color="rgba(255,255,255,0.7)" />
                  </Pressable>
                </View>

                {isWide ? (
                  <View style={styles.founderDividerVertical} />
                ) : (
                  <View style={styles.founderDivider} />
                )}

                {/* Alekhya */}
                <View style={[styles.founderEntry, isWide && { flex: 1 }]}>
                  <View style={styles.founderIcon}>
                    <Heart size={18} color={DARK_SAGE} />
                  </View>
                  <Text style={styles.founderName}>Alekhya Adamala</Text>
                  <Text style={styles.founderRole}>Operations & Marketing</Text>
                  <Text style={styles.founderBio}>
                    Executive MBA, ISB ● 12 years Tech Experience{'\n'}Designs
                    smooth end-to-end experiences. Believes great brands are built
                    behind the scenes — in logistics, quality, and consistency
                  </Text>
                  <Pressable
                    onPress={() => Linking.openURL('https://www.linkedin.com/in/alekhya-adamala/')}
                    style={styles.founderLinkedin}
                  >
                    <Linkedin size={16} color="rgba(255,255,255,0.7)" />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Decorative accents */}
            <View style={styles.teamAccentDot1} />
            <View style={styles.teamAccentDot2} />
          </Section>
        </View>

        {/* ─── CONTACT ─── */}
        <View onLayout={trackSection('contact')}>
          <Section style={styles.contact} isWide={isWide} innerStyle={{ alignItems: 'center' }}>
            <View style={styles.subHeaderRow}>
              <View style={styles.subHeaderLine} />
              <Text style={styles.subHeader}>Say Hello</Text>
              <View style={styles.subHeaderLine} />
            </View>
            <Text style={styles.subHeaderDesc}>
              We'd love to hear from you
            </Text>

            <View style={styles.contactCard}>
              <Pressable
                style={styles.contactRow}
                onPress={track('contact-email', 'Email', 'contact', () => setContactOpen(true))}
              >
                <View style={styles.contactIcon}>
                  <Mail size={18} color={DARK_SAGE} />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>hello@ateliya.in</Text>
                </View>
              </Pressable>

              <View style={styles.contactDivider} />

              <Pressable
                style={styles.contactRow}
                onPress={track('contact-whatsapp', 'WhatsApp', 'contact', () => Linking.openURL('https://wa.me/917702603311'))}
              >
                <View style={styles.contactIcon}>
                  <MessageCircle size={18} color={DARK_SAGE} />
                </View>
                <View>
                  <Text style={styles.contactLabel}>WhatsApp</Text>
                  <Text style={styles.contactValue}>77026 03311</Text>
                </View>
              </Pressable>
            </View>

            <View style={{ height: spacing.xxl }} />

            <Pressable
              style={({ pressed }) => [styles.pillBtn, pressed && styles.pressed]}
              onPress={track('contact-cta', 'GET STARTED', 'contact', () => Linking.openURL('https://wa.me/917702603311?text=Hi%2C%20I%20would%20like%20to%20Schedule%20a%20Pick%20Up'))}
            >
              <Text style={styles.pillBtnText}>GET STARTED</Text>
            </Pressable>

            <Text style={styles.signIn}>
              Already have an account?{' '}
              <Text style={styles.signInLink} onPress={track('sign-in-link', 'Sign In', 'contact', go)}>
                Sign In
              </Text>
            </Text>
          </Section>
        </View>

        {/* ─── FOOTER ─── */}
        <View style={styles.footer}>
          <Image
            source={require('../../assets/images/logo-light.png')}
            style={[styles.footerLogo, { tintColor: '#fff' }]}
            resizeMode="contain"
          />

          <View style={styles.socialRow}>
            {SOCIALS.map((s) => (
              <Pressable
                key={s.url}
                style={({ pressed }) => [
                  styles.socialIcon,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={track(`social-${s.platform}`, s.platform, 'footer', () => Linking.openURL(s.url))}
              >
                <s.icon size={20} color="rgba(255,255,255,0.7)" />
              </Pressable>
            ))}
          </View>

          <Text style={styles.footerCopy}>
            &copy; 2026 Ateliya by Arteshia. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* ─── MOBILE MENU OVERLAY ─── */}
      {menuOpen && (
        <View style={styles.overlay}>
          <Pressable
            style={styles.overlayClose}
            onPress={() => setMenuOpen(false)}
            hitSlop={8}
          >
            <X size={24} color="#fff" />
          </Pressable>
          <View style={styles.overlayBody}>
            {NAV_ITEMS.map((item, i) => (
              <Pressable
                key={item}
                onPress={track(`nav-${SECTION_KEYS[i]}`, item, 'nav', () => scrollTo(SECTION_KEYS[i]))}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text style={styles.overlayLink}>{item}</Text>
              </Pressable>
            ))}
            <View style={styles.overlaySocials}>
              {SOCIALS.map((s) => (
                <Pressable
                  key={s.url}
                  onPress={track(`social-${s.platform}`, s.platform, 'footer', () => Linking.openURL(s.url))}
                  style={({ pressed }) => [
                    styles.overlaySocialIcon,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <s.icon size={20} color="rgba(255,255,255,0.7)" />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ─── CONTACT FORM MODAL ─── */}
      {contactOpen && (
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => { if (!formSending) { setContactOpen(false); setFormSent(false); } }}
          />
          <View style={[styles.modalCard, isWide && styles.modalCardWide]}>
            <Pressable
              style={styles.modalClose}
              onPress={() => { if (!formSending) { setContactOpen(false); setFormSent(false); } }}
              hitSlop={8}
            >
              <X size={20} color={colors.mutedForeground} />
            </Pressable>

            {formSent ? (
              <View style={styles.modalSentWrap}>
                <View style={styles.modalSentIcon}>
                  <Check size={28} color="#fff" />
                </View>
                <Text style={styles.modalSentTitle}>Message sent!</Text>
                <Text style={styles.modalSentDesc}>We'll get back to you soon.</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.modalDesc, { fontWeight: '700' }]}>Drop us a message</Text>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Email *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!formSending}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Phone (optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={formPhone}
                    onChangeText={setFormPhone}
                    placeholder=""
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="phone-pad"
                    editable={!formSending}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.modalLabel}>Message *</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextarea]}
                    value={formMessage}
                    onChangeText={setFormMessage}
                    placeholder="Tell us how we can help..."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!formSending}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.modalSubmitBtn,
                    (!formEmail.trim() || !formMessage.trim()) && styles.modalSubmitDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleContactSubmit}
                  disabled={formSending || !formEmail.trim() || !formMessage.trim()}
                >
                  {formSending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Send size={16} color="#fff" />
                      <Text style={styles.modalSubmitText}>Send Message</Text>
                    </View>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

/* ─── Data ─── */
const DOORSTEP_SERVICES = [
  {
    icon: Scissors,
    title: 'Saree Fall & Pico',
    desc: 'Convenient pick and drop off for saree finishing',
  },
  {
    icon: Scissors,
    title: 'Alterations',
    desc: 'Sizing, correct fit, and repairs',
  },
  {
    icon: Shirt,
    title: 'FlexFit Blouse',
    desc: 'Convert your regular blouse to FlexFit with stretch panels',
  },
  {
    icon: RefreshCw,
    title: 'Repurposing',
    desc: 'Convert your unused sarees to stylish outfits',
  },
];

const ALMIRA_SERVICES = [
  {
    icon: Sparkles,
    title: 'Style Edits',
    desc: 'Curated monthly outfit ideas',
    badge: 'Coming Soon',
  },
  {
    icon: Shirt,
    title: 'Smart Wardrobe',
    desc: 'Your wardrobe digitized and personal',
    badge: 'Coming Soon',
  },
];

const SOCIALS = [
  { icon: MessageCircle, url: 'https://wa.me/917702603311', platform: 'whatsapp' },
  { icon: Instagram, url: 'https://instagram.com/ateliya.in', platform: 'instagram' },
  { icon: Youtube, url: 'https://youtube.com/@AteliyaFashion', platform: 'youtube' },
  { icon: Twitter, url: 'https://x.com/ateliyafashion', platform: 'x' },
  { icon: Linkedin, url: 'https://linkedin.com/company/ateliya', platform: 'linkedin' },
];

/* ─── Styles ─── */
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  /* ── Header ── */
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: 'rgba(248,247,244,0.85)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(90,107,82,0.15)',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
      } as any,
      default: {},
    }),
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: MAX_CONTENT,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
  },
  headerLogo: {
    height: 32,
    width: 100,
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    zIndex: 1,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: DARK_SAGE,
    opacity: 0.9,
  },

  /* ── Overlay ── */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,31,46,0.95)',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayClose: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.xxl,
    zIndex: 21,
    padding: spacing.sm,
  },
  overlayBody: {
    alignItems: 'center',
    gap: spacing.xxxl,
  },
  overlayLink: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 3,
    color: '#ffffff',
  },
  overlaySocials: {
    flexDirection: 'row',
    gap: spacing.xxl,
    marginTop: spacing.xxl,
  },
  overlaySocialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Shared ── */
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: '#5a6b52',
    marginBottom: spacing.md,
  },
  italic: {
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  pillBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: radii.full,
  },
  pillBtnText: {
    color: '#faf8f3',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.xxl + 4,
  },

  /* ── Hero ── */
  hero: {
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
    width: '100%',
  },
  heroImageCol: {
    flex: 1,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  heroImageWide: {
    width: '100%',
    height: 360,
    borderRadius: radii.xxl,
  },
  heroTextCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  heroDecor: {
    position: 'absolute',
    top: 30,
    right: -30,
    width: 260,
    height: 240,
    borderRadius: 48,
    backgroundColor: colors.surfaceMuted,
    transform: [{ rotate: '-8deg' }],
  },
  heroImageWrap: {
    width: '100%',
    height: 200,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTagline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  heroFlowText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: spacing.xl,
  },
  heroImagesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  heroImagesRowWide: {
    gap: spacing.md,
  },
  heroCta: {
    backgroundColor: DARK_SAGE,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
  heroCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1,
  },
  heroImgQuad: {
    flex: 1,
    height: 200,
    borderRadius: radii.lg,
  },
  heroImgGridItem: {
    flex: 1,
    height: 360,
    borderRadius: radii.lg,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 6,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  dividerDot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dividerLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.primary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  heroDesc: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },

  /* ── Curve ── */
  curveTransition: {
    height: 40,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
  },

  /* ── Services ── */
  services: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 40,
    width: '100%',
    marginBottom: spacing.md,
  },
  serviceGroup: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  subHeaderLine: {
    width: 28,
    height: 1,
    backgroundColor: colors.accent,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 1,
  },
  subHeaderDesc: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  cardGrid3: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  cardGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    width: '100%',
    justifyContent: 'space-between',
  },
  cardGrid2: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  serviceCard2x2: {
    flexBasis: '47%',
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: '47%',
  },
  serviceCard: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceCardWide: {
    padding: 30,
    borderRadius: radii.xl,
  },
  cardIconWrap: {
    marginBottom: spacing.md,
    overflow: 'visible',
    zIndex: 1,
  },
  cardIconBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconBadgeWide: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
  },
  serviceIconImg: {
    width: 36,
    height: 36,
  },
  serviceIconImgWide: {
    width: 52,
    height: 52,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardTitleWide: {
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  cardDesc: {
    fontSize: 11,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 16,
  },
  cardDescWide: {
    fontSize: 15,
    lineHeight: 23,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    backgroundColor: colors.muted,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: radii.full,
  },
  comingSoonText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.mutedForeground,
    letterSpacing: 0.3,
  },

  /* ── Our Story ── */
  story: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  storyRow: {
    flexDirection: 'row',
    gap: 40,
    width: '100%',
    alignItems: 'flex-start',
  },
  storyText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'justify',
    lineHeight: 23,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
    maxWidth: 500,
    alignSelf: 'center',
  },
  quoteBlock: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    maxWidth: 500,
    alignSelf: 'center',
  },
  quoteBlockWide: {
    flex: 1,
    marginTop: 0,
    alignSelf: 'center',
  },
  quoteLine: {
    width: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: spacing.lg,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.foreground,
    lineHeight: 26,
  },

  /* ── Team ── */
  team: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  teamCard: {
    backgroundColor: DARK_SAGE,
    borderRadius: 28,
    paddingTop: spacing.xxl + 4,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  teamCardWide: {
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 40,
  },
  teamHeading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.xxl,
  },
  foundersRow: {
    flexDirection: 'row',
    gap: 40,
    width: '100%',
    alignItems: 'flex-start',
  },
  founderEntry: {
    alignItems: 'center',
    width: '100%',
  },
  founderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  founderName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  founderRole: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  founderBio: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 21,
  },
  founderLinkedin: {
    marginTop: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  founderDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: spacing.xxl,
    alignSelf: 'center',
  },
  founderDividerVertical: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  teamAccentDot1: {
    position: 'absolute',
    top: 28,
    left: 32,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  teamAccentDot2: {
    position: 'absolute',
    top: 56,
    right: 40,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.secondary,
    opacity: 0.4,
  },

  /* ── Contact ── */
  contact: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  contactCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
    maxWidth: 340,
  },
  contactDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.foreground,
  },

  /* ── CTA ── */
  cta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: spacing.xxl,
  },
  signIn: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  signInLink: {
    color: colors.primary,
    fontWeight: '600',
  },

  /* ── Footer ── */
  footer: {
    backgroundColor: '#5a6b52',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl + 4,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  footerLogo: {
    height: 32,
    width: 100,
    marginBottom: spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.xxl,
    marginBottom: spacing.xl,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCopy: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },

  /* ── Contact Modal ── */
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: radii.xxl,
    padding: 28,
    width: '92%',
    maxWidth: 480,
    zIndex: 22,
  },
  modalCardWide: {
    padding: 40,
    maxWidth: 520,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 23,
    padding: spacing.xs,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  modalDesc: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
  },
  modalField: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs + 2,
    letterSpacing: 0.2,
  },
  modalInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.foreground,
  },
  modalTextarea: {
    minHeight: 140,
    paddingTop: 12,
  },
  modalSubmitBtn: {
    backgroundColor: DARK_SAGE,
    borderRadius: radii.full,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  modalSubmitDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalSentWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  modalSentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DARK_SAGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalSentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  modalSentDesc: {
    ...typography.body,
    color: colors.mutedForeground,
  },
});
