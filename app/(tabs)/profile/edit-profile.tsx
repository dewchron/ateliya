import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { SettingsField } from '../../../src/components/SettingsField';
import { useToast } from '../../../src/contexts/ToastContext';
import { getProfile, updateProfile } from '../../../src/services/profile.service';

export default function EditProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((p) => {
        if (p) {
          setFullName(p.full_name || '');
          setPhone(p.phone || '');
          setBirthDate(p.birth_date || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        birth_date: birthDate || null,
      });
      showToast('Profile saved');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubPage
      title="Profile"
      onBack={() => router.back()}
      actionLabel={saving ? 'Saving...' : 'Save'}
      onAction={handleSave}
      actionDisabled={saving}
    >
      <View style={styles.fields}>
        <SettingsField
          label="Full Name"
          placeholder="Your full name"
          value={fullName}
          onChangeText={setFullName}
        />
        <SettingsField
          label="Phone"
          placeholder="+91"
          keyboard="phone-pad"
          value={phone}
        />
        <SettingsField
          label="Birth Date"
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChangeText={setBirthDate}
          last
        />
      </View>
    </SubPage>
  );
}

const styles = StyleSheet.create({
  fields: {
    marginTop: spacing.sm,
  },
});
