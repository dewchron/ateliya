import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radii, shadows } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { SettingsField } from '../../../src/components/SettingsField';
import { useToast } from '../../../src/contexts/ToastContext';
import { getAddresses, upsertAddress } from '../../../src/services/address.service';
import type { Address } from '../../../src/types/database.types';

export default function AddressBookScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [existingId, setExistingId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAddresses()
      .then((addrs) => {
        if (addrs.length > 0) {
          const a = addrs[0];
          setExistingId(a.id);
          setAddressLine(a.address_line || '');
          setCity(a.city || '');
          setPinCode(a.pin_code || '');
          setLandmark(a.landmark || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertAddress({
        id: existingId,
        address_line: addressLine,
        city,
        pin_code: pinCode,
        landmark,
        is_default: true,
      });
      showToast('Address saved');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubPage
      title="Address Book"
      onBack={() => router.back()}
      actionLabel={saving ? 'Saving...' : 'Save'}
      onAction={handleSave}
      actionDisabled={saving}
    >
      <View style={styles.card}>
        <SettingsField
          label="Address"
          placeholder="Street address"
          multiline
          value={addressLine}
          onChangeText={setAddressLine}
        />
        <SettingsField
          label="City"
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />
        <SettingsField
          label="PIN"
          placeholder="6-digit PIN"
          keyboard="numeric"
          maxLength={6}
          value={pinCode}
          onChangeText={setPinCode}
        />
        <SettingsField
          label="Landmark"
          placeholder="Optional"
          value={landmark}
          onChangeText={setLandmark}
          last
        />
      </View>
    </SubPage>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
});
