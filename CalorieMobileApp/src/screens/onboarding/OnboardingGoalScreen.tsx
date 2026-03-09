import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';

const GOALS = [
  { value: 'lose_weight', icon: 'trending-down', labelKey: 'onboarding.loseWeight', desc: 'onboarding.loseWeightDesc' },
  { value: 'maintain', icon: 'swap-horizontal', labelKey: 'onboarding.maintain', desc: 'onboarding.maintainDesc' },
  { value: 'gain_weight', icon: 'trending-up', labelKey: 'onboarding.gainWeight', desc: 'onboarding.gainWeightDesc' },
];

export default function OnboardingGoalScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  const formData = route.params?.formData || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}><View style={[styles.progressBar, { width: '11%' }]} /></View>
      <Text style={styles.step}>{t('onboarding.step', { current: 1, total: 9 })}</Text>
      <Text style={styles.title}>{t('onboarding.goalTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.goalSubtitle')}</Text>

      <View style={styles.options}>
        {GOALS.map((g) => (
          <TouchableOpacity
            key={g.value}
            style={[styles.card, selected === g.value && styles.cardSelected]}
            onPress={() => setSelected(g.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, selected === g.value && styles.iconCircleSelected]}>
              <Ionicons name={g.icon as any} size={28} color={selected === g.value ? colors.textWhite : colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, selected === g.value && styles.cardLabelSelected]}>{t(g.labelKey)}</Text>
              <Text style={styles.cardDesc}>{t(g.desc)}</Text>
            </View>
            <View style={[styles.radio, selected === g.value && styles.radioSelected]}>
              {selected === g.value && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={() => selected && navigation.navigate('OnboardingGender', { formData: { ...formData, goal_type: selected } })}
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
  step: { fontSize: typography.sizes.sm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold as any, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl },
  options: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'], gap: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, borderWidth: 2, borderColor: colors.surfaceBorder },
  cardSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}08` },
  iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' },
  iconCircleSelected: { backgroundColor: colors.primary },
  cardText: { flex: 1, marginLeft: spacing.md },
  cardLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any, color: colors.textPrimary },
  cardLabelSelected: { color: colors.primary },
  cardDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.surfaceBorder, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  continueBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: colors.textWhite, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold as any },
});
