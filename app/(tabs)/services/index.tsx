import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Minus, Plus } from 'lucide-react-native';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { useBooking } from '../../../src/contexts/BookingContext';
import { useToast } from '../../../src/contexts/ToastContext';
import { getServicePrices, type ServicePrice } from '../../../src/services/pricing.service';
import { getOrderDetail } from '../../../src/services/order.service';
import { getAddresses } from '../../../src/services/address.service';
import { getCommunities } from '../../../src/services/community.service';
import { useAuth } from '../../../src/contexts/AuthContext';
import type { ServiceType } from '../../../src/types';

export default function ServicesScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { state, dispatch } = useBooking();
  const { session } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    state.cart.forEach((c) => { init[c.serviceId] = c.quantity; });
    return init;
  });

  // Load service prices once
  useEffect(() => {
    (async () => {
      try {
        const prices = await getServicePrices();
        setServices(prices);
      } catch {
        showToast('Failed to load services');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-set community date/time + load order data on every focus
  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        // Auto-set community date/time if not already set
        if (!orderId && session?.user?.id) {
          const [addrs, communities] = await Promise.all([getAddresses(), getCommunities()]);
          const def = addrs.find((a) => a.is_default) || addrs[0];
          if (def) {
            const addrLower = (def.address_line || '').toLowerCase();
            const match = communities.find((c) => {
              const cName = c.name.toLowerCase();
              return (def.landmark && cName === def.landmark.toLowerCase()) || addrLower.includes(cName);
            });
            if (match && !state.selectedDate) {
              dispatch({
                type: 'SELECT_COMMUNITY',
                communityId: match.id,
                communityName: match.name,
                date: match.planned_date || '',
                time: match.time_range || '',
              });
            }
          }
        }

        // If editing an existing order, always reload from database
        if (orderId) {
          const prices = await getServicePrices();
          setServices(prices);
          dispatch({ type: 'RESET' });
          dispatch({ type: 'SET_EDITING_ORDER', orderId });
          const order = await getOrderDetail(orderId);

          // Restore community/date/time from the order
          if (order.custom_community) {
            dispatch({ type: 'SET_CUSTOM_COMMUNITY', name: order.custom_community });
          }
          if (order.pickup_date || order.pickup_time) {
            dispatch({ type: 'SELECT_DATE', date: order.pickup_date || '' });
            dispatch({ type: 'SELECT_TIME', time: order.pickup_time || '' });
          }

          const initQty: Record<string, number> = {};

          for (const svc of (order.order_services ?? [])) {
            const priceRow = prices.find((p) =>
              p.service.toLowerCase() === svc.service_type.toLowerCase()
            );
            if (priceRow) {
              initQty[priceRow.id] = (initQty[priceRow.id] || 0) + (svc.quantity || 1);
            }
          }

          // Push into booking state
          for (const [sid, qty] of Object.entries(initQty)) {
            const svc = prices.find((p) => p.id === sid)!;
            dispatch({
              type: 'SET_CART_QTY',
              serviceId: sid,
              serviceName: svc.service,
              price: svc.price,
              quantity: qty,
            });
          }
          setQuantities(initQty);
        }
      } catch {}
    })();
  }, [orderId]));

  const getQty = (id: string) => quantities[id] || 0;

  const setQty = (id: string, qty: number) => {
    const clamped = Math.max(0, qty);
    setQuantities((prev) => ({ ...prev, [id]: clamped }));

    const svc = services.find((s) => s.id === id);
    if (clamped > 0) {
      dispatch({ type: 'SET_CART_QTY', serviceId: id, serviceName: svc?.service || id, price: svc?.price || 0, quantity: clamped });
    } else {
      dispatch({ type: 'REMOVE_FROM_CART', serviceId: id as ServiceType });
    }
  };

  const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  const handleAddToCart = () => {
    if (totalItems === 0) {
      showToast('Add at least one item');
      return;
    }

    // Push quantities into cart
    Object.entries(quantities).forEach(([serviceId, qty]) => {
      if (qty > 0) {
        const svc = services.find((s) => s.id === serviceId);
        dispatch({ type: 'SET_CART_QTY', serviceId, serviceName: svc?.service || serviceId, price: svc?.price || 0, quantity: qty });
      }
    });

    const cartRoute = orderId
      ? `/(tabs)/services/cart?orderId=${orderId}`
      : '/(tabs)/services/cart';
    router.push(cartRoute as any);
  };

  if (loading) {
    return (
      <SubPage title="Services" onBack={() => router.push('/(tabs)' as any)}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SubPage>
    );
  }

  return (
    <SubPage
      title="Services"
      onBack={() => router.push('/(tabs)' as any)}
      actionLabel={totalItems > 0 ? 'View Cart' : undefined}
      onAction={totalItems > 0 ? handleAddToCart : undefined}
    >
      {services.map((svc) => {
        const qty = getQty(svc.id);
        return (
          <View
            key={svc.id}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.textBox}>
                <Text style={styles.name}>{svc.service}</Text>
                <Text style={styles.price}>₹{svc.price}</Text>
              </View>

              {qty === 0 ? (
                <Pressable
                  onPress={() => setQty(svc.id, 1)}
                  style={styles.addBtn}
                >
                  <Text style={styles.addBtnText}>Add</Text>
                </Pressable>
              ) : (
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => setQty(svc.id, qty - 1)}
                    style={styles.stepBtn}
                  >
                    <Minus size={14} color={colors.foreground} />
                  </Pressable>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <Pressable
                    onPress={() => setQty(svc.id, qty + 1)}
                    style={styles.stepBtn}
                  >
                    <Plus size={14} color={colors.foreground} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        );
      })}
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
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bullet: {
    fontSize: 18,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  textBox: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addBtn: {
    width: 80,
    height: 28,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(169,191,160,0.4)',
    backgroundColor: 'rgba(169,191,160,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    height: 28,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(169,191,160,0.4)',
    backgroundColor: 'rgba(169,191,160,0.12)',
    overflow: 'hidden',
  },
  stepBtn: {
    width: 26,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
});
