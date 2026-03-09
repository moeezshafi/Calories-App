import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

const FREQUENCIES = [
  { value: 'never', icon: 'close-circle-outline', labelKey: 'onboarding.workoutNever', descKey: 'onboarding.workoutNeverDesc' },
  { value: 'light_1_2', icon: 'body-outline', labelKey: 'onboarding.workout1_2', descKey: 'onboarding.workout1_2Desc' },
  { value: 'moderate_3_4', icon: 'fitness-outline', labelKey: 'onboarding.workout3_4', descKey: 'onboarding.workout3_4Desc' },
  { value: 'heavy_5_plus', icon: 'trophy-outline', labelKey: 'onboarding.workout5Plus', descKey: 'onboarding.workout5PlusDesc' },
];

export default function OnboardingWorkoutScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  const formData = route.params?.formData || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}><View style={[styles.progressBar, { width: '100%' }]} /></View>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.step}>{t('onboarding.step', { current: 9, total: 9 })}</Text>
      <Text style={styles.title}>{t('onboarding.workoutTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.workoutSubtitle')}</Text>

      <View style={styles.options}>
        {FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.card, selected === f.value && styles.cardSelected]}
            onPress={() => setSelected(f.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, selected === f.value && styles.iconCircleSelected]}>
              <Ionicons name={f.icon as any} size={24} color={selected === f.value ? colors.textWhite : colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, selected === f.value && styles.cardLabelSelected]}>{t(f.labelKey)}</Text>
              <Text style={styles.cardDesc}>{t(f.descKey)}</Text>
            </View>
            <View style={[styles.radio, selected === f.value && styles.radioSelected]}>
              {selected === f.value && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={() => selected && navigation.navigate('OnboardingSummary', { formData: { ...formData, workout_frequency: selected } })}
          disabled={!selected}
        >
          <Text style={styles.continueBtnText}>{t('onboarding.continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progress: { height: 4, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: spacing.md, borderRadius: 2 },
  progressBar: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  backBtn: { marginLeft: spacing.xl, marginTop: spacing.md, width: 40 },
  step: { fontSize: typography.sizes.sm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl },
  options: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'], gap: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, borderWidth: 2, borderColor: colors.surfaceBorder },
  cardSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}08` },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' },
  iconCircleSelected: { backgroundColor: colors.primary },
  cardText: { flex: 1, marginLeft: spacing.md },
  cardLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: colors.textPrimary },
  cardLabelSelected: { color: colors.primary },
  cardDesc: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
