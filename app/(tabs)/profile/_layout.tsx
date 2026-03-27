import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="address-book" />
      <Stack.Screen name="measurements" />
      <Stack.Screen name="order-history" />
      <Stack.Screen name="address-picker" />
      <Stack.Screen name="help-center" />
    </Stack>
  );
}
