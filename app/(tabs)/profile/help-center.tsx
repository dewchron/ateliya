import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, MessageCircle, HelpCircle, ChevronRight, ChevronDown } from 'lucide-react-native';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';

const FAQ_ITEMS = [
  {
    question: 'What is Ateliya?',
    answer: 'Ateliya provides quality fashion services at your doorstep. You just have to schedule — we pick up, we service, and we deliver.',
  },
  {
    question: 'What services do you provide?',
    answer: '• Saree Fall & Pico\n• Alterations\n• Repairs\n• FlexFit Blouses\n• Repurposing\n\nWe are expanding our service suite rapidly to bring you personal styling, wardrobe management, and more.',
  },
  {
    question: 'What is a FlexFit Blouse?',
    answer: 'We convert your regular blouses to FlexFit by attaching stretch panels on the sleeves and sides. The blouse can stretch up to 6 inches, breaking the alteration cycle for size adjustments. It also provides all-day comfort, so you can bring the elegance of the saree to your work.\n\nCheck our Instagram @ateliya.in for more details about FlexFit.',
  },
  {
    question: 'What is Repurposing?',
    answer: 'We convert your low-utility sarees into Salwar, Lehenga, Gown, Blazer, Kids Clothes, Home Decor, Bags, and more — making them high utility.',
  },
  {
    question: 'What is the time between pickup and delivery?',
    answer: 'Clothes will be delivered in 1 week. If we pick up on a Monday, we deliver it on next Monday.',
  },
  {
    question: 'How to cancel a pickup?',
    answer: 'Pickups can be canceled for free until 9 AM on the day of the pickup. If you cancel after 9 AM, we offer a one-time credit.',
  },
];

const PHONE_NUMBER = '+917702603311';
const WHATSAPP_NUMBER = '917702603311';
const WHATSAPP_MESSAGE = 'Hi, I need help with my Ateliya order.';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [faqOpen, setFaqOpen] = useState(false);
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const handleCall = () => {
    Linking.openURL(`tel:${PHONE_NUMBER}`);
  };

  const handleChat = () => {
    const encoded = encodeURIComponent(WHATSAPP_MESSAGE);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    Linking.openURL(url);
  };

  return (
    <SubPage title="Help Center" onBack={() => router.back()}>
      <View style={st.container}>
        <Pressable
          style={({ pressed }) => [st.row, pressed && st.rowPressed]}
          onPress={handleCall}
        >
          <Phone size={20} color={colors.primary} strokeWidth={1.5} />
          <View style={st.rowText}>
            <Text style={st.rowTitle}>Call</Text>
            <Text style={st.rowDesc}>+91 77026 03311</Text>
          </View>
          <ChevronRight size={18} color={colors.mutedForeground} />
          <View style={st.rowDivider} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [st.row, pressed && st.rowPressed]}
          onPress={handleChat}
        >
          <MessageCircle size={20} color={colors.primary} strokeWidth={1.5} />
          <View style={st.rowText}>
            <Text style={st.rowTitle}>Chat</Text>
            <Text style={st.rowDesc}>Message us on WhatsApp</Text>
          </View>
          <ChevronRight size={18} color={colors.mutedForeground} />
          <View style={st.rowDivider} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [st.row, pressed && st.rowPressed]}
          onPress={() => setFaqOpen(!faqOpen)}
        >
          <HelpCircle size={20} color={colors.primary} strokeWidth={1.5} />
          <View style={st.rowText}>
            <Text style={st.rowTitle}>FAQ</Text>
            <Text style={st.rowDesc}>Frequently asked questions</Text>
          </View>
          {faqOpen ? (
            <ChevronDown size={18} color={colors.mutedForeground} />
          ) : (
            <ChevronRight size={18} color={colors.mutedForeground} />
          )}
        </Pressable>
      </View>

      {faqOpen && (
        <View style={st.faqList}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndices.has(i);
            return (
              <Pressable
                key={i}
                style={st.faqItem}
                onPress={() => {
                  const next = new Set(openIndices);
                  isOpen ? next.delete(i) : next.add(i);
                  setOpenIndices(next);
                }}
              >
                <View style={st.faqRow}>
                  {isOpen ? (
                    <ChevronDown size={14} color={colors.mutedForeground} />
                  ) : (
                    <ChevronRight size={14} color={colors.mutedForeground} />
                  )}
                  <Text style={st.faqQuestion}>{item.question}</Text>
                </View>
                {isOpen && <Text style={[st.faqAnswer, { marginLeft: 14 + spacing.md }]}>{item.answer}</Text>}
              </Pressable>
            );
          })}
        </View>
      )}
    </SubPage>
  );
}

const st = StyleSheet.create({
  container: {
    paddingTop: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    gap: spacing.lg,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  rowDivider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.dividerLight,
  },
  faqList: {
    paddingLeft: 0,
  },
  faqItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    flex: 1,
    marginRight: spacing.sm,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
