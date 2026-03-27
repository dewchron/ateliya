import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { Home, Store, ShoppingCart, User } from 'lucide-react-native';
import { useBooking } from '../../src/contexts/BookingContext';
import { colors } from '../../src/constants/theme';
import { MobileContainer } from '../../src/components/MobileContainer';
import { useAuth } from '../../src/contexts/AuthContext';

function TabIcon({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <View {...Platform.select({ web: { title: label } as any, default: {} })}>
      {children}
    </View>
  );
}

export default function TabLayout() {
  const { gender } = useAuth();
  const router = useRouter();
  const { state } = useBooking();
  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <MobileContainer>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.98)',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0,0,0,0.1)',
          height: 58,
          paddingTop: 8,
          borderBottomWidth: 1.5,
          borderBottomColor: 'rgba(0,0,0,0.1)',
          ...Platform.select({
            web: {
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -1px 0 0 rgba(0,0,0,0.05)',
            } as any,
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon label="Home"><Home size={20} color={color} /></TabIcon>,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          // TODO: hide Services for men when men's experience is built
          // href: gender === 'male' ? null : undefined,
          tabBarIcon: ({ color }) => <TabIcon label="Services"><Store size={20} color={color} /></TabIcon>,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace('/(tabs)/services' as any);
          },
        }}
      />
      <Tabs.Screen
        name="almira"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <TabIcon label="Cart"><ShoppingCart size={20} color={color} /></TabIcon>,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 10, minWidth: 16, height: 16, lineHeight: 16 },
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            const route = state.editingOrderId
              ? `/(tabs)/services/cart?orderId=${state.editingOrderId}`
              : '/(tabs)/services/cart';
            router.push(route as any);
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon label="Profile"><User size={20} color={color} /></TabIcon>,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace('/(tabs)/profile' as any);
          },
        }}
      />
    </Tabs>
    </MobileContainer>
  );
}
