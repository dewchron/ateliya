import { Stack } from 'expo-router';

export default function AlmiraLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
