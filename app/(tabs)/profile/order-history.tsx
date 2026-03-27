import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Package, Pencil } from 'lucide-react-native';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { getOrders, subscribeToOrders } from '../../../src/services/order.service';
import { useAuth } from '../../../src/contexts/AuthContext';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pickup Scheduled',
  confirmed: 'Pickup On the Way',
  received: 'Order Received',
  in_progress: 'Service in Progress',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatPickupDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatBookedDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type FilterTab = 'open' | 'completed' | 'cancelled';

const FILTER_STATUSES: Record<FilterTab, string[]> = {
  open: ['pending', 'confirmed', 'received', 'in_progress', 'out_for_delivery'],
  completed: ['completed'],
  cancelled: ['cancelled'],
};

const FILTER_LABELS: Record<FilterTab, string> = {
  open: 'Open',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('open');

  const loadOrders = () => {
    getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { loadOrders(); }, []));

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    const channel = subscribeToOrders(userId, () => loadOrders());
    return () => { channel.unsubscribe(); };
  }, [session?.user?.id]);

  if (loading) {
    return (
      <SubPage title="My Orders" onBack={() => router.push('/(tabs)/profile')}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SubPage>
    );
  }

  return (
    <SubPage title="My Orders" onBack={() => router.push('/(tabs)/profile')}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['open', 'completed', 'cancelled'] as FilterTab[]).map((tab) => {
          const count = orders.filter((o) => FILTER_STATUSES[tab].includes(o.status)).length;
          const isActive = activeFilter === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {FILTER_LABELS[tab]}{count > 0 ? ` (${count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {orders.filter((o) => FILTER_STATUSES[activeFilter].includes(o.status)).length === 0 ? (
        <View style={styles.empty}>
          <Package size={32} color={colors.mutedForeground} />
          <Text style={styles.emptyText}>No {FILTER_LABELS[activeFilter].toLowerCase()} orders</Text>
        </View>
      ) : (
        orders.filter((o) => FILTER_STATUSES[activeFilter].includes(o.status)).map((order) => {
          const services = order.order_services ?? [];
          const title = services.length > 0
            ? services.map((s: any) => s.service_type).join(', ')
            : 'Order';

          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardContent}>
                  {/* Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Text>
                    </View>
                  </View>

                  {/* Services with qty */}
                  {services.map((s: any, i: number) => (
                    <Text key={i} style={styles.serviceRow}>
                      {s.service_type}{(s.quantity || 1) > 1 ? ` × ${s.quantity}` : ''}
                    </Text>
                  ))}

                  {/* Total */}
                  {order.total_amount > 0 && (
                    <Text style={styles.totalAmount}>₹{order.total_amount}</Text>
                  )}

                  {/* Pickup date */}
                  {order.pickup_date && (
                    <Text style={styles.pickupDate}>
                      Pickup: {formatPickupDate(order.pickup_date)}
                    </Text>
                  )}

                  {/* Booked date */}
                  <Text style={styles.bookedDate}>
                    Booked {formatBookedDate(order.created_at)}
                  </Text>
                </View>

                {/* Edit icon */}
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <Pressable
                    style={styles.editBtn}
                    onPress={() => router.push(`/(tabs)/services?orderId=${order.id}` as any)}
                  >
                    <Pencil size={16} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>
            </View>
          );
        })
      )}
    </SubPage>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: colors.muted,
  },
  filterTabActive: {
    backgroundColor: colors.foreground,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  filterTabTextActive: {
    color: colors.primaryForeground,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
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
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  editBtn: {
    padding: 8,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    flex: 1,
    marginRight: spacing.md,
  },
  serviceRow: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '500',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: 4,
    marginBottom: 2,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderColor: colors.foreground,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  pickupDate: {
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 4,
  },
  bookedDate: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
    opacity: 0.6,
  },
});
