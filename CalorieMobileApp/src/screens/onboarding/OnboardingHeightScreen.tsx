import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';

type HeightUnit = 'cm' | 'ft';

export default function OnboardingHeightScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [height, setHeight] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [unit, setUnit] = useState<HeightUnit>('cm');
  const formData = route.params?.formData || {};

  const getHeightCm = (): number => {
    if (unit === 'cm') return parseFloat(height) || 0;
    const ft = parseFloat(height) || 0;
    const inches = parseFloat(heightInches) || 0;
    return Math.round((ft * 30.48 + inches * 2.54) * 10) / 10;
  };

  const h = getHeightCm();
  const valid = unit === 'cm'
    ? height && !isNaN(parseFloat(height)) && h >= 100 && h <= 250
    : height && !isNaN(parseFloat(height)) && h >= 100 && h <= 250;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progress}><View style={[styles.progressBar, { width: '44%' }]} /></View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.step}>{t('onboarding.step', { current: 4, total: 9 })}</Text>
        <Text style={styles.title}>{t('onboarding.heightTitle')}</Text>

        {/* Unit Toggle */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'cm' && styles.unitBtnActive]}
            onPress={() => { setUnit('cm'); setHeight(''); setHeightInches(''); }}
          >
            <Text style={[styles.unitBtnText, unit === 'cm' && styles.unitBtnTextActive]}>cm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'ft' && styles.unitBtnActive]}
            onPress={() => { setUnit('ft'); setHeight(''); setHeightInches(''); }}
          >
            <Text style={[styles.unitBtnText, unit === 'ft' && styles.unitBtnTextActive]}>ft / in</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputArea}>
          {unit === 'cm' ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                placeholder="170"
                placeholderTextColor={colors.textTertiary}
                maxLength={5}
                autoFocus
              />
              <Text style={styles.unitLabel}>cm</Text>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { minWidth: 70 }]}
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                placeholder="5"
                placeholderTextColor={colors.textTertiary}
                maxLength={1}
                autoFocus
              />
              <Text style={styles.unitLabel}>ft</Text>
              <TextInput
                style={[styles.input, { minWidth: 70 }]}
                value={heightInches}
                onChangeText={setHeightInches}
                keyboardType="number-pad"
                placeholder="7"
                placeholderTextColor={colors.textTertiary}
                maxLength={2}
              />
              <Text style={styles.unitLabel}>in</Text>
            </View>
          )}
          {height && !valid && <Text style={styles.error}>{t('onboarding.heightError')}</Text>}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !valid && styles.continueBtnDisabled]}
            onPress={() => valid && navigation.navigate('OnboardingWeight', { formData: { ...formData, height: h } })}
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
  input: { fontSize: 64, fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', minWidth: 140 },
  unitLabel: { fontSize: typography.sizes.xl, color: colors.textSecondary },
  error: { fontSize: typography.sizes.sm, color: colors.error, marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
