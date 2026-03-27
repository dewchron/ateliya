import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radii } from '../../../src/constants/theme';
import { SubPage } from '../../../src/components/PageLayout';
import { SettingsFieldRow, SettingsSmallField } from '../../../src/components/SettingsField';
import { useToast } from '../../../src/contexts/ToastContext';
import { getMeasurements, upsertMeasurement } from '../../../src/services/measurement.service';

export default function MeasurementsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [existingId, setExistingId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMeasurements()
      .then((m) => {
        if (m) {
          setExistingId(m.id);
          setBust(m.bust_cm?.toString() || '');
          setWaist(m.waist_cm?.toString() || '');
          setHips(m.hips_cm?.toString() || '');
          setShoulder(m.shoulder_cm?.toString() || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertMeasurement({
        id: existingId,
        bust_cm: bust ? parseFloat(bust) : null,
        waist_cm: waist ? parseFloat(waist) : null,
        hips_cm: hips ? parseFloat(hips) : null,
        shoulder_cm: shoulder ? parseFloat(shoulder) : null,
        measured_by: 'self',
      });
      showToast('Measurements saved');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubPage
      title="Measurements"
      onBack={() => router.back()}
      actionLabel={saving ? 'Saving...' : 'Save'}
      onAction={handleSave}
      actionDisabled={saving}
    >
      <View style={styles.fields}>
        <SettingsFieldRow>
          <SettingsSmallField
            label="Bust (cm)"
            placeholder="—"
            keyboard="numeric"
            showDivider
            value={bust}
            onChangeText={setBust}
          />
          <SettingsSmallField
            label="Waist (cm)"
            placeholder="—"
            keyboard="numeric"
            value={waist}
            onChangeText={setWaist}
          />
        </SettingsFieldRow>
        <SettingsFieldRow last>
          <SettingsSmallField
            label="Hips (cm)"
            placeholder="—"
            keyboard="numeric"
            showDivider
            value={hips}
            onChangeText={setHips}
          />
          <SettingsSmallField
            label="Shoulder (cm)"
            placeholder="—"
            keyboard="numeric"
            value={shoulder}
            onChangeText={setShoulder}
          />
        </SettingsFieldRow>
      </View>

      <View style={styles.tip}>
        <Info size={16} color={colors.primary} style={{ marginTop: 1 }} />
        <Text style={styles.tipText}>
          Get free professional measurements with any service!
        </Text>
      </View>
    </SubPage>
  );
}

const styles = StyleSheet.create({
  fields: {
    marginTop: spacing.sm,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.foreground,
    lineHeight: 18,
  },
});
