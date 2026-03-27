import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, radii, shadows } from '../constants/theme';

const ToastContext = createContext<{
  showToast: (message: string) => void;
}>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    opacity.setValue(0);
    translateY.setValue(50);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 50, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 2500);
  }, [opacity, translateY]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View
          style={[styles.toast, { opacity, transform: [{ translateY }] }]}
          pointerEvents="none"
        >
          <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: colors.foreground,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radii.xl,
    ...shadows.toast,
  },
  toastText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '500',
  },
});
