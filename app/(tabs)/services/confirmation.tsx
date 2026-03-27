import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, MapPin, Calendar, Clock } from 'lucide-react-native';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { useBooking } from '../../../src/contexts/BookingContext';
import { useToast } from '../../../src/contexts/ToastContext';
import { createOrder } from '../../../src/services/order.service';
import type { Order } from '../../../src/types/database.types';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [communityName, setCommunityName] = useState('');
  const didSubmit = useRef(false);

  useEffect(() => {
    if (didSubmit.current) return;
    didSubmit.current = true;
    (async () => {
      try {
        const totalAmount = state.cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
        const services = state.cart.map((c) => ({
          serviceType: c.serviceName || c.serviceId,
          quantity: c.quantity,
        }));

        const communityName = state.selectedCommunityName || state.customCommunity || '';
        setCommunityName(communityName);

        const result = await createOrder({
          pickupDate: state.selectedDate || '',
          pickupTime: state.selectedTime || '',
          services,
          customCommunity: communityName || undefined,
          paymentId: state.paymentId || undefined,
          totalAmount,
        });
        setOrder(result);
      } catch (err: any) {
        showToast(err.message || 'Failed to create booking');
      } finally {
        setSubmitting(false);
      }
    })();
  }, []);

  const handleDone = () => {
    dispatch({ type: 'RESET' });
    router.replace('/(tabs)/profile/order-history' as any);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const totalAmount = state.cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  if (submitting) {
    return (
      <SubPage title="Confirmation" onBack={() => router.back()}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Creating your booking...</Text>
        </View>
      </SubPage>
    );
  }

  return (
    <SubPage
      title="Confirmation"
      onBack={handleDone}
      actionLabel="Track Order"
      onAction={handleDone}
    >
      {/* Success banner */}
      <View style={styles.successBanner}>
        <CheckCircle size={22} color={colors.liveText} />
        <Text style={styles.successText}>Booking Confirmed</Text>
      </View>

      {/* Location & schedule info */}
      {communityName ? (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={15} color={colors.primary} />
            <Text style={styles.infoText}>{communityName}</Text>
          </View>
          {state.selectedDate ? (
            <View style={styles.infoRow}>
              <Calendar size={15} color={colors.primary} />
              <Text style={styles.infoSub}>{formatDate(state.selectedDate)}</Text>
            </View>
          ) : null}
          {state.selectedTime ? (
            <View style={styles.infoRow}>
              <Clock size={15} color={colors.primary} />
              <Text style={styles.infoSub}>{state.selectedTime}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Order items */}
      {state.cart.map((item) => (
        <View key={item.serviceId} style={styles.cartItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.serviceName || item.serviceId}</Text>
          </View>
          <Text style={styles.itemQty}>×{item.quantity}</Text>
          <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
        </View>
      ))}

      {/* Total */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>₹{totalAmount}</Text>
        </View>
      </View>
    </SubPage>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: colors.mutedForeground,
  },

  // Success banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.infoBg,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.infoBg,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  infoSub: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: '500',
  },

  // Order items
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xs,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginRight: 12,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    width: 60,
    textAlign: 'right',
  },

  // Summary
  summaryCard: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xs,
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.dividerLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.foreground,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
});
