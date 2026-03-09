import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

type WeightUnit = 'kg' | 'lbs';

export default function OnboardingWeightScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const formData = route.params?.formData || {};

  const getWeightKg = (): number => {
    const val = parseFloat(weight) || 0;
    return unit === 'kg' ? val : Math.round(val * 0.453592 * 10) / 10;
  };

  const w = getWeightKg();
  const rawVal = parseFloat(weight) || 0;
  const valid = weight && !isNaN(rawVal) && (unit === 'kg'
    ? rawVal >= 30 && rawVal <= 300
    : rawVal >= 66 && rawVal <= 660);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progress}><View style={[styles.progressBar, { width: '55%' }]} /></View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.step}>{t('onboarding.step', { current: 5, total: 9 })}</Text>
        <Text style={styles.title}>{t('onboarding.weightTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.weightSubtitle')}</Text>

        {/* Unit Toggle */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
            onPress={() => { setUnit('kg'); setWeight(''); }}
          >
            <Text style={[styles.unitBtnText, unit === 'kg' && styles.unitBtnTextActive]}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'lbs' && styles.unitBtnActive]}
            onPress={() => { setUnit('lbs'); setWeight(''); }}
          >
            <Text style={[styles.unitBtnText, unit === 'lbs' && styles.unitBtnTextActive]}>lbs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder={unit === 'kg' ? '70' : '154'}
              placeholderTextColor={colors.textTertiary}
              maxLength={5}
              autoFocus
            />
            <Text style={styles.unitLabel}>{unit}</Text>
          </View>
          {weight && !valid && <Text style={styles.error}>{t('onboarding.weightError')}</Text>}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !valid && styles.continueBtnDisabled]}
            onPress={() => valid && navigation.navigate('OnboardingTargetWeight', { formData: { ...formData, weight: w, weight_unit: unit } })}
            disabled={!valid}
          >
            <Text style={styles.continueBtnText}>{t('onboarding.continue')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progress: { height: 4, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: spacing.md, borderRadius: 2 },
  progressBar: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  backBtn: { marginLeft: spacing.xl, marginTop: spacing.md, width: 40 },
  step: { fontSize: typography.sizes.sm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  unitToggle: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, gap: 0 },
  unitBtn: {
    paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  unitBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitBtnText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium as any, color: colors.textSecondary },
  unitBtnTextActive: { color: colors.textWhite },
  inputArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  input: { fontSize: 64, fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', minWidth: 130 },
  unitLabel: { fontSize: typography.sizes.xl, color: colors.textSecondary },
  error: { fontSize: typography.sizes.sm, color: colors.error, marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
