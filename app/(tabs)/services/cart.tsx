import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MapPin, Calendar, Clock, Minus, Plus, ShoppingBag } from 'lucide-react-native';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { useBooking } from '../../../src/contexts/BookingContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useToast } from '../../../src/contexts/ToastContext';
import { createRazorpayOrder, openRazorpayCheckout } from '../../../src/services/payment.service';
import { getOrderDetail, updateOrder } from '../../../src/services/order.service';
import { getAddresses } from '../../../src/services/address.service';
import type { ServiceType } from '../../../src/types';


export default function CartScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { state, dispatch } = useBooking();
  const { profile, phoneNumber } = useAuth();
  const { showToast } = useToast();
  const [paying, setPaying] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [originalCart, setOriginalCart] = useState<string>('');
  const [loadingOrder, setLoadingOrder] = useState(!!orderId);
  const [addressLine, setAddressLine] = useState('');

  // Fetch user's default address
  useEffect(() => {
    (async () => {
      try {
        const addrs = await getAddresses();
        const def = addrs.find((a) => a.is_default) || addrs[0];
        if (def) setAddressLine(def.address_line || '');
      } catch {}
    })();
  }, []);

  // Fetch already-paid amount and snapshot original cart for existing orders
  useEffect(() => {
    if (!orderId) { setLoadingOrder(false); return; }
    (async () => {
      try {
        const order = await getOrderDetail(orderId);
        setPaidAmount(order.total_amount || 0);
        // Snapshot: sorted string of "serviceName:qty" to detect changes
        const snap = (order.order_services ?? [])
          .map((s: any) => `${s.service_type}:${s.quantity || 1}`)
          .sort()
          .join('|');
        setOriginalCart(snap);
      } catch (err: any) {
        showToast(err.message || 'Failed to load order');
      } finally {
        setLoadingOrder(false);
      }
    })();
  }, [orderId]);

  const communityName = state.selectedCommunityName || state.customCommunity || '';
  const totalItems = state.cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalAmount = state.cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const amountDue = orderId ? Math.max(0, totalAmount - paidAmount) : totalAmount;

  // Detect if cart changed from the original order
  const currentCartSnap = state.cart
    .map((c) => `${c.serviceName || c.serviceId}:${c.quantity}`)
    .sort()
    .join('|');
  const hasChanges = orderId ? currentCartSnap !== originalCart : true;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const month = d.toLocaleDateString('en-IN', { month: 'long' });
    const day = d.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
    return `${weekday}, ${month} ${day}${suffix}`;
  };

  const locationLine = (() => {
    const parts = [addressLine, communityName].filter(Boolean);
    // Deduplicate if address already contains the community name
    if (parts.length === 2 && addressLine.toLowerCase().includes(communityName.toLowerCase())) {
      return addressLine;
    }
    return parts.join(', ');
  })();
  const dateLine = state.selectedDate ? formatDate(state.selectedDate) : '';
  const hasPickupInfo = locationLine || dateLine || state.selectedTime;

  const handleRemove = (serviceId: ServiceType) => {
    dispatch({ type: 'REMOVE_FROM_CART', serviceId });
  };

  const handleUpdate = async () => {
    if (!orderId) return;

    // No changes — just go back
    if (!hasChanges) {
      dispatch({ type: 'RESET' });
      router.replace('/(tabs)/profile/order-history' as any);
      return;
    }

    setPaying(true);
    try {
      const services = state.cart.map((c) => ({
        serviceType: c.serviceName || c.serviceId,
        quantity: c.quantity,
      }));

      if (amountDue > 0) {
        // Pay the differential amount
        const amountPaise = amountDue * 100;
        const { order_id } = await createRazorpayOrder(amountPaise);

        const payment = await openRazorpayCheckout({
          orderId: order_id,
          amountPaise,
          customerName: profile?.full_name || '',
          customerPhone: phoneNumber?.replace('+91', '') || '',
          description: `Update order — ₹${amountDue} additional`,
        });

        // Payment successful — update order with new services & total
        await updateOrder(orderId, { services, totalAmount });
        showToast('Order updated');
      } else {
        // Value stayed same or decreased — update without payment
        await updateOrder(orderId, { services, totalAmount });
        showToast('Order updated');
      }

      dispatch({ type: 'RESET' });
      router.replace('/(tabs)/profile/order-history' as any);
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        showToast(err.message || 'Failed to update order');
      }
    } finally {
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (totalAmount <= 0) {
      router.push('/(tabs)/services/confirmation' as any);
      return;
    }

    setPaying(true);
    try {
      const amountPaise = totalAmount * 100;
      const { order_id } = await createRazorpayOrder(amountPaise);

      const payment = await openRazorpayCheckout({
        orderId: order_id,
        amountPaise,
        customerName: profile?.full_name || '',
        customerPhone: phoneNumber?.replace('+91', '') || '',
        description: `${totalItems} service${totalItems > 1 ? 's' : ''} — Ateliya`,
      });

      // Payment successful — store payment ID and proceed
      dispatch({ type: 'SET_PAYMENT', paymentId: payment.razorpay_payment_id });
      router.push('/(tabs)/services/confirmation' as any);
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        showToast(err.message || 'Payment failed');
      }
    } finally {
      setPaying(false);
    }
  };

  if (loadingOrder) {
    return (
      <SubPage title="Cart" onBack={() => router.back()}>
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SubPage>
    );
  }

  if (state.cart.length === 0) {
    return (
      <SubPage title="Cart" onBack={() => router.back()}>
        <View style={styles.emptyWrap}>
          <ShoppingBag size={40} color={colors.border} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Pressable onPress={() => router.replace('/(tabs)/services' as any)} style={styles.browseBtn}>
            <Text style={styles.browseBtnText}>Browse Services</Text>
          </Pressable>
        </View>
      </SubPage>
    );
  }

  return (
    <SubPage
      title="Cart"
      onBack={() => router.back()}
      actionLabel={paying ? 'Processing...' : orderId ? (!hasChanges ? 'Done' : amountDue > 0 ? `Pay ₹${amountDue}` : 'Update Order') : 'Checkout'}
      onAction={orderId ? handleUpdate : handlePay}
      actionDisabled={paying}
    >
      {/* Pickup info */}
      {hasPickupInfo ? (
        <View style={styles.infoCard}>
          <Text style={styles.pickupHeading}>Your order will be picked up from</Text>
          {locationLine ? (
            <View style={styles.infoRow}>
              <MapPin size={14} color={colors.primary} />
              <Text style={styles.infoDetail}>{locationLine}</Text>
            </View>
          ) : null}
          {dateLine ? (
            <View style={styles.infoRow}>
              <Calendar size={14} color={colors.primary} />
              <Text style={styles.infoDetail}>{dateLine}</Text>
            </View>
          ) : null}
          {state.selectedTime ? (
            <View style={styles.infoRow}>
              <Clock size={14} color={colors.primary} />
              <Text style={styles.infoDetail}>{state.selectedTime}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Cart items */}

      {state.cart.map((item) => (
        <View key={item.serviceId} style={styles.cartItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>
              {item.serviceName || item.serviceId}
            </Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => {
                if (item.quantity <= 1) handleRemove(item.serviceId);
                else dispatch({ type: 'SET_CART_QTY', serviceId: item.serviceId, serviceName: item.serviceName, price: item.price, quantity: item.quantity - 1 });
              }}
              style={styles.stepBtn}
            >
              <Minus size={12} color={colors.foreground} />
            </Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable
              onPress={() => dispatch({ type: 'SET_CART_QTY', serviceId: item.serviceId, serviceName: item.serviceName, price: item.price, quantity: item.quantity + 1 })}
              style={styles.stepBtn}
            >
              <Plus size={12} color={colors.foreground} />
            </Pressable>
          </View>
          <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
        </View>
      ))}

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>₹{totalAmount}</Text>
        </View>
        {orderId && paidAmount > 0 && (
          <>
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text style={styles.summarySubLabel}>Already Paid</Text>
              <Text style={styles.summarySubValue}>– ₹{paidAmount}</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text style={styles.summaryLabel}>Amount Due</Text>
              <Text style={styles.summaryValue}>₹{amountDue}</Text>
            </View>
          </>
        )}
      </View>
    </SubPage>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.mutedForeground,
  },
  browseBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryForeground,
  },

  // Info card
  infoCard: {
    backgroundColor: colors.infoBg,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  pickupHeading: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoDetail: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cart items
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
    marginBottom: 3,
  },
  itemMeta: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
    width: 60,
    textAlign: 'right',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 64,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(169,191,160,0.4)',
    backgroundColor: 'rgba(169,191,160,0.12)',
    overflow: 'hidden',
    marginRight: 12,
  },
  stepBtn: {
    width: 20,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.foreground,
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
  summarySubLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  summarySubValue: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
});
